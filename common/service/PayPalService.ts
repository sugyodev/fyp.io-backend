import axios, { AxiosInstance } from "axios";

export class PayPalService {
	private readonly axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance) {
		this.axiosInstance = axiosInstance;
	}

	async addProduct(productData: {
		name: string;
		description: string;
		type: string;
		category: string;
	}) {
		return await this.axiosInstance.post("/catalogs/products", {
			name: productData.name,
			description: productData.description,
			type: productData.type,
			category: productData.category,
		});
	}

	async addBillingPlan(planData: {
		product_id: string;
		name: string;
		description: string;
		amount: number;
	}) {
		return await this.axiosInstance.post("/billing/plans", {
			product_id: planData.product_id,
			name: planData.name,
			description: planData.description,
			status: "active",
			billing_cycles: [
				{
					frequency: {
						interval_unit: "MONTH",
						interval_count: 1,
					},
					tenure_type: "REGULAR",
					sequence: 1,
					total_cycles: 0,
					pricing_scheme: {
						fixed_price: {
							value: planData.amount,
							currency_code: "USD",
						},
					},
				},
			],
			payment_preferences: {
				payment_failure_threshold: 0,
			},
		});
	}

	async verifyWebhookEvent(data: {
		auth_algo: string;
		cert_url: string;
		transmission_id: string;
		transmission_sig: string;
		transmission_time: string;
		webhook_id: string;
		webhook_event: any;
	}) {
		const endpoint = `/notifications/verify-webhook-signature`;
		return await this.axiosInstance.post(endpoint, data);
	}

	async getSubscriptionDetails(subscriptionId: string) {
		return await this.axiosInstance.get(
			`/billing/subscriptions/${subscriptionId}`
		);
	}
}

export async function paypalServiceFactory(): Promise<PayPalService> {
	const mode = process.env.PAYPAL_MODE as "sandbox" | "production";
	const clientId = process.env.PAYPAL_CLIENT_ID;
	const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

	if (!clientId) {
		throw new Error("Missing PAYPAL_CLIENT_ID");
	}

	if (!clientSecret) {
		throw new Error("Missing PAYPAL_CLIENT_SECRET");
	}

	let credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
		"base64"
	);

	let paypalApiUrls = {
		sandbox: "https://api-m.sandbox.paypal.com/v1",
		production: "https://api-m.paypal.com/v1",
	};
	let paypalApi = paypalApiUrls[mode] || paypalApiUrls.production;

	const axiosInstance = axios.create({
		baseURL: paypalApi,
		headers: {
			Authorization: `Basic ${credentials}`,
		},
	});

	return new PayPalService(axiosInstance);
}
