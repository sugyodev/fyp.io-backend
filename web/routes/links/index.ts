import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { LinksController } from "./controller";

import { createCustomLinkDto, createSocialLinkDto, saveSocialLinksDto, saveCustomLinksDto, readByParamDto } from "./requestDto";

export default async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const { container } = fastify;

  const linksController = new LinksController(fastify);
  await linksController.initialize();

  const sessionManager = await container.resolve(SessionManagerService);

  fastify.post<{ Body: createSocialLinkDto }>(
    "/create-social-link",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.createSocialLink
  );

  fastify.post<{ Body: createCustomLinkDto }>(
    "/create-custom-link",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.createCustomLink
  );

  fastify.get<{ Params: readByParamDto }>(
    "/read-social-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.readSocialLink
  );

  fastify.get<{ Params: readByParamDto }>(
    "/read-custom-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.readCustomLink
  );

  fastify.put<{ Body: createSocialLinkDto }>(
    "/update-social-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.updateSocialLink
  );

  fastify.put<{ Body: createCustomLinkDto }>(
    "/update-custom-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.updateCustomLink
  );

  fastify.delete<{ Params: readByParamDto }>(
    "/delete-social-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.readSocialLink
  );

  fastify.delete<{ Params: readByParamDto }>(
    "/delete-custom-link/:id",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.deleteCustomLink
  );

  fastify.get(
    "/get-social-links",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.getSocialLinks
  );

  fastify.get(
    "/get-custom-links",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.getCustomLinks
  );

  fastify.post<{ Body: saveSocialLinksDto }>(
    "/save-social-links",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.saveSocialLinks
  );

  fastify.post<{ Body: saveCustomLinksDto }>(
    "/save-custom-links",
    {
      preHandler: [
        sessionManager.sessionPreHandler,
        sessionManager.requireAuthHandler,
      ],
    },
    linksController.saveCustomLinks
  );
}
