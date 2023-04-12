import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { createInterestItemDto, interestItemParamDto } from './requestDto';
import { createInterestItemSchema } from './schema';
import { InterestItemController } from './controller';

import { isEmailValid, isUsernameValid } from "../../../common/Validation";

export default async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const { container } = fastify;
  const sessionManager = await container.resolve(SessionManagerService);

  const interestItemController = new InterestItemController(fastify);
  await interestItemController.initialize();

  fastify.post<{ Body: createInterestItemDto }>(
    "/create",
    {
      schema: createInterestItemSchema,
      // preHandler: [sessionManager.sessionPreHandler],
    },
    interestItemController.createInterestItem
  );

  fastify.get(
    "/read",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ]
    },
    interestItemController.readInterestItems
  );

  fastify.put<{ Body: createInterestItemDto; Params: interestItemParamDto; }>(
    "/update/:id",
    {
      schema: createInterestItemSchema,
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    interestItemController.updateInterestItem
  );

  fastify.delete<{ Params: interestItemParamDto }>(
    "/delete/:id",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    interestItemController.deleteInterestItem
  );
}

