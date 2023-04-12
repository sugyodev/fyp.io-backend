import axios, { AxiosInstance } from "axios";

export class ReferralService {
	private readonly axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance) {
		this.axiosInstance = axiosInstance;
	}

	async validateReferralUrl(referralUrl: string, linkname: string) {
		return await this.axiosInstance.post("/validate", {
			referralUrl,
			linkname,
		});
	}
}

export async function referralServiceFactory(): Promise<ReferralService> {
	if (!process.env.REFERRAL_VALIDATION_API) {
		throw new Error("Missing REFERRAL_VALIDATION_API");
	}

	if (!process.env.REFERRAL_MIN_FOLLOWERS) {
		throw new Error("Missing REFERRAL_MIN_FOLLOWERS");
	}

	const axiosInstance = axios.create({
		baseURL: process.env.REFERRAL_VALIDATION_API,
	});

	return new ReferralService(axiosInstance);
}
