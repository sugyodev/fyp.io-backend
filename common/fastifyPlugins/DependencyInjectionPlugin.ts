import { Container } from "async-injection";
import {
	FastifyInstance,
	FastifyPluginAsync,
	FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
	interface FastifyInstance {
		container: Container;
	}
}

export interface DependencyInjectionPluginOptions extends FastifyPluginOptions {
	container: Container;
}

const dependencyInjectionPlugin: FastifyPluginAsync<
	DependencyInjectionPluginOptions
> = async (
	fastify: FastifyInstance,
	options: DependencyInjectionPluginOptions
) => {
	fastify.decorate("container", options.container);
};

export default fp(dependencyInjectionPlugin, { fastify: "4.x" });
