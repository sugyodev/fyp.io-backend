import {
	FastifyInstance,
	FastifyPluginAsync,
	FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { Session } from "../service/SessionManagerService";

declare module "fastify" {
	interface FastifyRequest {
		session: Session | undefined;
	}
}

const sessionManagerPlugin: FastifyPluginAsync<FastifyPluginOptions> = async (
	fastify: FastifyInstance
) => {
	fastify.decorateRequest("session", null);
};

export default fp(sessionManagerPlugin, { fastify: "4.x" });
