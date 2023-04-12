import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { checkLinknameDto, loginDataDto, signupDataDto } from "./requestDto";
import { checkLinknameSchema, loginSchema, signupSchema } from "./schema";
import { ClaimController } from "./controller";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;
	const sessionManager = await container.resolve(SessionManagerService);

	const claimController = new ClaimController(fastify);
	await claimController.initialize();

	fastify.post<{ Body: checkLinknameDto }>(
		"/check",
		{
			schema: checkLinknameSchema,
		},
		claimController.checkLinkname
	);

	fastify.post<{ Body: signupDataDto }>(
		"/signup",
		{
			schema: signupSchema,
		},
		claimController.signup
	);

	fastify.post<{ Body: loginDataDto }>(
		"/login",
		{
			schema: loginSchema,
		},
		claimController.login
	);

	fastify.post<{ Body: {} }>(
		"/logout",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		claimController.logout
	);
}
