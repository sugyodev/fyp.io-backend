import fastifyCors from "@fastify/cors";
import { Container } from "async-injection";
import Fastify from "fastify";
import { Logger } from "pino";
import DependencyInjectionPlugin from "../common/fastifyPlugins/DependencyInjectionPlugin";

export default async function main(container: Container) {
	container = container.clone();

	const logger = await container.resolve<Logger>("logger");

	const host = process.env.HOST_ADMIN ?? "::";
	const port = Number(process.env.PORT_ADMIN ?? 3001);

	const fastify = Fastify({
		logger,
	});

	// this must be the first thing registered in order to use DI in routes
	await fastify.register(DependencyInjectionPlugin, { container });

	fastify.register(fastifyCors);
	fastify.register(import("./services/blackWords"), {
		prefix: "/api/v1/admin/service/blackword",
	});
	fastify.register(import("./services/interestCategories"), {
		prefix: "/api/v1/admin/service/interestCategory",
	});
	fastify.register(import("./services/interestItems"), {
		prefix: "/api/v1/admin/service/interestItem",
	});
	// fastify.register(import("./routes/auth"), { prefix: "/api/auth" });

	await fastify.listen({
		host,
		port,
	});
}
