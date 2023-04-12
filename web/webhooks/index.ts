import { FastifyInstance, FastifyPluginOptions } from "fastify";

import APIErrors from "../../common/APIErrors";
import { User } from "../../common/database/entities/User";
import { Subscription } from "../../common/database/entities/Subscription";
import { DataSourceService } from "../../common/service/DataSourceService";
import { StripeService } from "../../common/service/StripeService";
import { PayPalService } from "../../common/service/PayPalService";

interface StripeSubscriptionWebhookData {
	id: string;
	status: string;
	subscription: string;
	start_date: number;
	current_period_end: number;
	payment_method: string;
	metadata: {
		user: string;
		subscription: string;
		price: string;
		coupon: string;
	};
}

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const stripe = await container.resolve(StripeService);
	const paypal = await container.resolve(PayPalService);

	const dataSource = await container.resolve(DataSourceService);

	const userRepo = dataSource.getRepository(User);
	const subscriptionRepo = dataSource.getRepository(Subscription);

	fastify.post(
		"/stripe",
		{
			schema: {
				body: {
					type: "object",
				},
			},
			config: {
				rawBody: true,
			},
		},
		async (request, reply) => {
			let sig = request.headers["stripe-signature"] as string;

			let event;

			if (!request.rawBody) {
				return reply.code(400).send({
					message: "No webhook payload",
				});
			}

			try {
				event = stripe.constructEvent(
					Buffer.from(request.rawBody),
					sig,
					process.env.STRIPE_WEBHOOK_SECRET as string
				);
			} catch (err) {
				return reply.code(400).send({
					message: "Invalid webhook payload",
				});
			}

			let event_type = event.type;
			let data = event.data.object as StripeSubscriptionWebhookData;
			let eventStatus = data.status;
			let eventSubscriptionId;

			if (event_type === "invoice.paid") {
				eventSubscriptionId = data.subscription;
			} else if (event_type.startsWith("customer.subscription")) {
				eventSubscriptionId = data.id;
			}

			let subscription;

			if (event_type === "payment_intent.succeeded") {
				subscription = await subscriptionRepo.findOneBy({
					id: data.metadata.subscription,
				});
			} else {
				if (!eventSubscriptionId) {
					return reply.code(400).send({
						message:
							"Webhook payload does not contain subscription id",
					});
				}

				subscription = await subscriptionRepo.findOneBy({
					subscriptionId: eventSubscriptionId,
				});
			}

			if (!subscription) {
				return reply.code(400).send({
					message: APIErrors.SUBSCRIPTION_NOT_FOUND,
				});
			}

			if (event_type === "payment_intent.succeeded") {
				const user = await userRepo.findOneBy({
					id: data.metadata.user,
				});

				if (!user) {
					return reply.code(400).send({
						message: APIErrors.USER_NOT_FOUND,
					});
				}

				let customer;
				try {
					customer = await stripe.createCustomer({
						email: user.email,
						payment_method_id: data.payment_method,
					});
				} catch (err: any) {
					if (err.code === "resource_already_exists") {
						return reply.send({ success: true });
					}

					return reply.code(400).send({
						message: err.message,
					});
				}

				let stripeSubscription;
				try {
					stripeSubscription = await stripe.createSubscription({
						customer_id: customer.id,
						price_id: data.metadata.price,
						coupon: data.metadata.coupon,
					});
				} catch (err: any) {
					return reply.code(400).send({
						message: err.message,
					});
				}

				subscription.subscriptionId = stripeSubscription.id;
				await subscriptionRepo.save(subscription);

				return reply.send({ success: true });
			}

			let status;

			switch (event_type) {
				case "invoice.paid":
					status = "active";
					break;
				default:
					status = eventStatus;
					break;
			}

			let eventStartDate = data.start_date * 1000;
			let eventCurrentPeriodEnd = data.current_period_end * 1000;

			if (
				subscription &&
				subscription.status === "active" &&
				status !== "active" &&
				status !== "created" &&
				subscription.nextBillingAt
			) {
				subscription.endSubscriptionAt = subscription.nextBillingAt;
				subscription.nextBillingAt = null;
			} else {
				if (eventStartDate) {
					subscription.startSubscriptionAt = eventStartDate;
				}

				if (eventCurrentPeriodEnd) {
					subscription.nextBillingAt = eventCurrentPeriodEnd;
				}
			}

			subscription.status = status;

			await subscriptionRepo.save(subscription);

			return reply.send({ success: true });
		}
	);

	fastify.post(
		"/paypal",
		{
			schema: {
				body: {
					type: "object",
				},
			},
		},
		async (request, reply) => {
			if (!request.body) {
				return reply.code(400).send({
					message: "No webhook payload",
				});
			}

			const webhookId = process.env.PAYPAL_WEBHOOK_ID as string;
			const transmissionId = request.headers[
				"paypal-transmission-id"
			] as string;
			const certUrl = request.headers["paypal-cert-url"] as string;
			const authAlgo = request.headers["paypal-auth-algo"] as string;
			const transmissionSig = request.headers[
				"paypal-transmission-sig"
			] as string;
			const transmissionTime = request.headers[
				"paypal-transmission-time"
			] as string;

			let webhookEventVerifyResponse = await paypal.verifyWebhookEvent({
				auth_algo: authAlgo,
				cert_url: certUrl,
				transmission_id: transmissionId,
				transmission_sig: transmissionSig,
				transmission_time: transmissionTime,
				webhook_id: webhookId,
				webhook_event: request.body,
			});

			if (
				webhookEventVerifyResponse.data.verification_status !==
				"SUCCESS"
			) {
				return reply.code(400).send({
					message: "Invalid webhook payload",
				});
			}

			interface EventResource {
				id: string;
				status: string;
				custom_id: string;
				start_time: string;
				end_time: string;
			}

			interface Event {
				event_type: string;
				resource: EventResource;
			}

			let event = request.body as Event;

			let subscriptionDetailsResponse =
				await paypal.getSubscriptionDetails(event.resource.id);

			let subscriptionDetails = subscriptionDetailsResponse.data;

			let eventType = event.event_type;

			let eventResource = event.resource as {
				id: string;
				status: string;
				custom_id: string;
				start_time: string;
				end_time: string;
			};

			let eventStatus = eventResource.status;
			let eventSubscriptionId = eventResource.custom_id;

			if (!eventSubscriptionId) {
				return reply.code(400).send({
					message: "Webhook payload does not contain subscription id",
				});
			}

			let subscription = await subscriptionRepo.findOneBy({
				subscriptionId: eventSubscriptionId,
			});

			if (!subscription) {
				return reply.code(400).send({
					message: APIErrors.SUBSCRIPTION_NOT_FOUND,
				});
			}

			let status;

			switch (eventType) {
				case "BILLING.SUBSCRIPTION.ACTIVATED":
					status = "active";
					break;
				case "BILLING.SUBSCRIPTION.CANCELLED":
					status = "cancelled";
					break;
				case "BILLING.SUBSCRIPTION.CREATED":
					status = "created";
					break;
				case "BILLING.SUBSCRIPTION.EXPIRED":
					status = "expired";
					break;
				case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
					status = "payment failed";
					break;
				case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
					status = "active";
					break;
				case "BILLING.SUBSCRIPTION.SUSPENDED":
					status = "suspended";
					break;
				default:
					switch (eventStatus) {
						case "CREATED":
							status = "created";
							break;
						case "INACTIVE":
							status = "canceled";
							break;
						case "ACTIVE":
							status = "active";
							break;
						case "APPROVAL_PENDING":
							status = "incomplete";
							break;
						case "APPROVED":
							status = "incomplete";
							break;
						case "SUSPENDED":
							status = "suspended";
							break;
						case "CANCELLED":
							status = "canceled";
							break;
						case "EXPIRED":
							status = "expired";
							break;
						default:
							return reply.code(400).send({
								message: "Invalid subscription status",
							});
					}
					break;
			}

			let eventStartDate = new Date(
				subscriptionDetails.start_time
			).getTime();
			let eventCurrentPeriodEnd = new Date(
				subscriptionDetails.billing_info?.next_billing_time
			).getTime();

			if (
				subscription &&
				subscription.status === "active" &&
				status !== "active" &&
				status !== "created" &&
				subscription.nextBillingAt
			) {
				subscription.endSubscriptionAt = subscription.nextBillingAt;
				subscription.nextBillingAt = null;
			} else {
				if (eventStartDate) {
					subscription.startSubscriptionAt = eventStartDate;
				}

				if (eventCurrentPeriodEnd) {
					subscription.nextBillingAt = eventCurrentPeriodEnd;
				}
			}

			subscription.status = status;

			await subscriptionRepo.save(subscription);

			return reply.send({ success: true });
		}
	);
}
