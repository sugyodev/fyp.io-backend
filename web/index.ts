import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import FastifyStatic from "@fastify/static";

import multer from "fastify-multer";

import { Container } from "async-injection";

import { Logger } from "pino";

import DependencyInjectionPlugin from "../common/fastifyPlugins/DependencyInjectionPlugin";
import SessionManagerPlugin from "../common/fastifyPlugins/SessionManagerPlugin";
import { RedisService } from "../common/service/RedisService";
import path from "path";

export const thisIsTheWebModuleWtf = true;

export default async function main(container: Container) {
  container = container.clone();

  const logger = await container.resolve<Logger>("logger");
  const redis = await container.resolve(RedisService);

  const host = process.env.HOST_BACKEND ?? "::";
  const port = Number(process.env.PORT_BACKEND ?? 3000);

  const fastify = Fastify({
    logger,
  });

  // this must be the first thing registered in order to use DI in routes
  await fastify.register(DependencyInjectionPlugin, { container });
  await fastify.register(SessionManagerPlugin);

  fastify.register(fastifyCors);

  fastify.register(fastifyRateLimit, {
    redis,
    nameSpace: "fyp:web:rate-limit:",
  });

	fastify.register(multer.contentParser);

  fastify.register(import("./routes/auth"), { prefix: "/api/auth" });
  fastify.register(import("./routes/support"), { prefix: "/api/support" });

  fastify.register(import("./routes/claim"), { prefix: "/api/claim" });
  fastify.register(import("./routes/profile"), { prefix: "/api/profile" });

  fastify.register(import("./routes/checkout"), { prefix: "/api/checkout" });

  fastify.register(import("./routes/links"), { prefix: "/api/links" });

  fastify.register(import("./routes/referral"), { prefix: "/api/referral" });

  fastify.register(import("fastify-raw-body"), {
    field: "rawBody",
    global: false,
    encoding: false,
    runFirst: true,
    routes: ["/webhooks"],
  });

  fastify.register(import("./webhooks"), { prefix: "/webhooks" });

  await fastify.listen({
    host,
    port,
  });
}
