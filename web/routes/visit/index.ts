import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { ProfileController } from "./controller";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const profileController = new ProfileController(fastify);

	const sessionManager = await container.resolve(SessionManagerService);

	fastify.get(
		"/info",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.getProfiles
	);

	fastify.post(
		"/setCategories",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.setCategories
	);
}
