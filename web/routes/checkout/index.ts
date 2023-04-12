import { FastifyInstance, FastifyPluginOptions, FastifyReply } from "fastify";

import APIErrors, { sendError } from "../../../common/APIErrors";
import { User } from "../../../common/database/entities/User";
import { Subscription } from "../../../common/database/entities/Subscription";
import { DataSourceService } from "../../../common/service/DataSourceService";
import { SessionManagerService } from "../../../common/service/SessionManagerService";
import SnowflakeService from "../../../common/service/SnowflakeService";
import { StripeService } from "../../../common/service/StripeService";

const plans = [
	{
		provider: "stripe",
		plan: "Starter",
		price: 5,
		plan_id: "price_1MlzbjEwfABzm1g1VoXqp6FD",
	},
	{
		provider: "stripe",
		plan: "Premium",
		price: 15,
		plan_id: "price_1Mm0EOEwfABzm1g1vXzVQSXI",
	},
	{
		provider: "paypal",
		plan: "Starter",
		price: 5,
		plan_id: "P-1NN00032L6636594CMQHWLDQ",
	},
	{
		provider: "paypal",
		plan: "Premium",
		price: 15,
		plan_id: "P-3EU58073D09964005MQHY4AY",
	},
];

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const stripe = await container.resolve(StripeService);
	const snowflake = await container.resolve(SnowflakeService);
	const dataSource = await container.resolve(DataSourceService);
	const sessionManager = await container.resolve(SessionManagerService);

	const userRepo = dataSource.getRepository(User);
	const subscriptionRepo = dataSource.getRepository(Subscription);

	const handleError = (reply: FastifyReply, error: any) => {
		let message = error?.raw?.message;
		if (typeof message !== "string")
			message = "An unknown payment error has occurred.";

		sendError(reply, APIErrors.PAYMENT_FAILED(message));
	};

	fastify.post<{
		Body: {
			plan: string;
			discountCode?: string;
		};
	}>(
		"/stripe",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						plan: { type: "string" },
						discountCode: { type: "string" },
					},
					required: ["plan"],
				},
			},
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},

		async (request, reply) => {
			const { plan, discountCode } = request.body;

			const session = request.session!;
			const user = await session.getUser(userRepo);

			const planObject = plans.find(
				(p) => p.plan === plan && p.provider === "stripe"
			);

			if (!planObject) {
				reply.code(400).send({ message: "Invalid plan" });
				return;
			}

			const existingSubscription = await subscriptionRepo.findOne({
				where: { owner: user },
			});

			if (existingSubscription) {
				const isSubscriptionActive =
					existingSubscription.status === "active";

				const doesSubscriptionEndInTheFuture =
					existingSubscription.endSubscriptionAt &&
					existingSubscription.endSubscriptionAt > Date.now();

				if (isSubscriptionActive || doesSubscriptionEndInTheFuture) {
					return reply.status(400).send({
						message:
							"Subscription already exists and is active or has not yet expired.",
					});
				}

				await subscriptionRepo.delete(existingSubscription.id);
			}

			const subscription = new Subscription();
			subscription.id = snowflake.genStr();
			subscription.status = "created";
			subscription.plan = plan;
			subscription.owner = user;
			await subscriptionRepo.save(subscription);

			let paymentIntent;
			try {
				paymentIntent = await stripe.createPaymentIntent({
					amount: planObject.price,
					metadata: {
						user: user.id,
						subscription: subscription.id,
						price: planObject.plan_id,
						coupon: discountCode || "",
					},
				});
			} catch (error) {
				return handleError(reply, error);
			}

			return reply.send({ clientSecret: paymentIntent.client_secret });
		}
	);

	fastify.post<{
		Body: {
			plan: string;
		};
	}>(
		"/paypal",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						plan: { type: "string" },
					},
					required: ["plan"],
				},
			},
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		async (request, reply) => {
			const { plan } = request.body;

			const session = request.session!;
			const user = await session.getUser(userRepo);

			const planObject = plans.find(
				(p) => p.plan === plan && p.provider === "paypal"
			);

			if (!planObject) {
				reply.code(400).send({ message: "Invalid plan" });
				return;
			}

			const existingSubscription = await subscriptionRepo.findOne({
				where: { owner: user },
			});

			if (existingSubscription) {
				const isSubscriptionActive =
					existingSubscription.status === "active";

				const doesSubscriptionEndInTheFuture =
					existingSubscription.endSubscriptionAt &&
					existingSubscription.endSubscriptionAt > Date.now();

				if (isSubscriptionActive || doesSubscriptionEndInTheFuture) {
					return reply.status(400).send({
						message:
							"Subscription already exists and is active or has not yet expired.",
					});
				}

				await subscriptionRepo.delete(existingSubscription.id);
			}

			// let product;
			// try {
			// 	product = await paypal.addProduct({
			// 		name: `${plan} Plan`,
			// 		description: `${plan} Plan`,
			// 		type: "SERVICE",
			// 		category: "ADVERTISING",
			// 	});
			// } catch (error: any) {
			// 	return handleError(reply, error);
			// }

			// let billingPlan;
			// try {
			// 	billingPlan = await paypal.addBillingPlan({
			// 		product_id: product.data.id,
			// 		name: `${product.data.name} Plan`,
			// 		description: `${product.data.description}`,
			// 		amount: amount,
			// 	});
			// } catch (error: any) {
			// 	return handleError(reply, error);
			// }

			const billingPlan = {
				data: {
					id: planObject.plan_id,
				},
			};

			let id = snowflake.genStr();
			const subscription = new Subscription();
			subscription.id = id;
			subscription.status = "created";
			subscription.plan = plan;
			subscription.subscriptionId = id;
			subscription.owner = user;
			await subscriptionRepo.save(subscription);

			return reply.send({
				planId: billingPlan.data.id,
				subscriptionId: id,
			});
		}
	);

	fastify.post<{
		Body: {
			plan: string;
		};
	}>(
		"/price",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						plan: { type: "string" },
					},
					required: ["plan"],
				},
			},
		},
		async (request, reply) => {
			const { plan } = request.body;

			const planObject = plans.find((p) => p.plan === plan);

			if (!planObject) {
				reply.code(400).send({ message: "Invalid plan" });
				return;
			}

			return reply.send({
				plan: planObject.plan,
				price: planObject.price,
			});
		}
	);
}
