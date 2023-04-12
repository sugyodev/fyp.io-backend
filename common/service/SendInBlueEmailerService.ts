import { EmailerService, SendEmailData } from "./EmailerService";

import {
	SendSmtpEmail,
	TransactionalEmailsApi,
	TransactionalEmailsApiApiKeys,
} from "sib-api-v3-typescript";

export class SendInBlueEmailerService extends EmailerService {
	#apiInstance: TransactionalEmailsApi;

	constructor() {
		super();

		if (!process.env.SENDINBLUE_API_KEY) {
			throw new Error("Missing SENDINBLUE_API_KEY");
		}

		this.#apiInstance = new TransactionalEmailsApi();
		this.#apiInstance.setApiKey(
			TransactionalEmailsApiApiKeys.apiKey,
			process.env.SENDINBLUE_API_KEY
		);
	}

    async sendEmail(email: SendEmailData): Promise<void> {
        const payload: SendSmtpEmail = {
            sender: { email: email.sender },
            to: email.to.map((to) => ({ email: to })),
            subject: email.subject,
            htmlContent: email.htmlContent,
            textContent: email.textContent,
            // attachment: email.attachment, // TODO: Attachments?
        };

        await this.#apiInstance.sendTransacEmail(payload);
    }
}

export async function sendInBlueEmailerFactory(): Promise<SendInBlueEmailerService> {
	return new SendInBlueEmailerService();
}
