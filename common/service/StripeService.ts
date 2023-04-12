import Stripe from "stripe";

export class StripeService {
	readonly #stripe: Stripe;
	readonly #secretKey: string;

	constructor(secretKey: string, stripe: Stripe) {
		this.#stripe = stripe;
		this.#secretKey = secretKey;
	}

	get secretKey(): string {
		return this.#secretKey;
	}

	async createPaymentIntent(paymentIntentDetails: {
		amount: number;
		metadata: {
			[key: string]: string;
		};
	}): Promise<Stripe.PaymentIntent> {
		return await this.#stripe.paymentIntents.create({
			amount: paymentIntentDetails.amount * 100,
			currency: "usd",
			metadata: paymentIntentDetails.metadata,
			setup_future_usage: "off_session",
		});
	}

	async createPaymentMethod(cardDetails: {
		card: {
			number: string;
			exp_month: number;
			exp_year: number;
			cvc: string;
		};
		billing_details: {
			name: string;
			address: {
				line1: string;
				state: string;
				postal_code: string;
				country: string;
			};
		};
	}): Promise<Stripe.PaymentMethod> {
		return await this.#stripe.paymentMethods.create({
			type: "card",
			card: {
				number: cardDetails.card.number,
				exp_month: cardDetails.card.exp_month,
				exp_year: cardDetails.card.exp_year,
				cvc: cardDetails.card.cvc,
			},
			billing_details: {
				name: cardDetails.billing_details.name,
				address: {
					line1: cardDetails.billing_details.address.line1,
					state: cardDetails.billing_details.address.state,
					postal_code:
						cardDetails.billing_details.address.postal_code,
					country: cardDetails.billing_details.address.country,
				},
			},
		});
	}

	async createCustomer(customerDetails: {
		email: string;
		payment_method_id: string | undefined;
	}): Promise<Stripe.Customer> {
		return await this.#stripe.customers.create({
			email: customerDetails.email,
			payment_method: customerDetails.payment_method_id,
			invoice_settings: {
				default_payment_method: customerDetails.payment_method_id,
			},
		});
	}

	async createPrice(priceDetails: {
		unit_amount: number;
		plan: string;
	}): Promise<Stripe.Price> {
		return await this.#stripe.prices.create({
			unit_amount: priceDetails.unit_amount * 100,
			currency: "usd",
			product_data: {
				name: `${priceDetails.plan} Plan`,
			},
			recurring: {
				interval: "month",
			},
		});
	}

	async createSubscription(subscriptionDetails: {
		customer_id: string;
		price_id: string;
		coupon: string | undefined;
	}): Promise<Stripe.Subscription> {
		return await this.#stripe.subscriptions.create({
			customer: subscriptionDetails.customer_id,
			items: [{ price: subscriptionDetails.price_id }],
			coupon: subscriptionDetails.coupon,
			expand: ["latest_invoice.payment_intent"],
		});
	}

	constructEvent(
		rawBody: Buffer,
		signature: string,
		webhookSecret: string
	): Stripe.Event {
		return this.#stripe.webhooks.constructEvent(
			rawBody,
			signature,
			webhookSecret
		);
	}
}

export async function stripeServiceFactory(): Promise<StripeService> {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("Missing STRIPE_SECRET_KEY");
	}

	const secretKey = process.env.STRIPE_SECRET_KEY;
	const apiVersion = "2022-11-15";
	const stripe = new Stripe(secretKey, { apiVersion });
	return new StripeService(secretKey, stripe);
}
