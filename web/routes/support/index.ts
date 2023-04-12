import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Logger } from "pino";
import APIErrors, { sendError } from "../../../common/APIErrors";
import {
	EmailerService,
	SendEmailData,
} from "../../../common/service/EmailerService";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const emailer = await container.resolve(EmailerService);
	const logger = await container.resolve<Logger>("logger");

	fastify.post<{
		Body: {
			name: string;
			email: string;
			subject: string;
			message: string;
			files: string[];
		};
	}>(
		"/email",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						name: { type: "string" },
						email: { type: "string" },
						subject: { type: "string" },
						message: { type: "string" },
						// TODO: how is this supposed to work?
						// pass the URLs, have separate endpoint for attachments that returns an ID or whatever?
						// files: { type: "array", items: { type: "string" } },
					},
					required: ["name", "email", "subject", "message"],
				},
			},
		},
		async (request, reply) => {
			const { name, email, subject, message, files } = request.body;

			if (!name || !email || !subject || !message) {
				return sendError(reply, APIErrors.FILL_ALL_FIELDS);
			}

			const sendSmtpEmail: SendEmailData = {
				sender: "support@onlyfans.gg",
				to: ["support@onlyfans.gg"],

				// TODO: Sanitize HTML
				htmlContent: `
				<p>Name: ${name}</p>
				<p>Email: ${email}</p>
				<p>Subject: ${subject}</p>
				<p>Message: ${message}</p>
			`,
				subject: `Contact Form Submission - ${subject}`,
				// attachment: files,
			};

			try {
				await emailer.sendEmail(sendSmtpEmail);
				reply.send({ message: "Message sent successfully" });
			} catch (error) {
				logger.error("Failed to send email", error);
				return sendError(reply, APIErrors.GENERIC_ERROR);
			}
		}
	);
}
