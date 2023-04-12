import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { createInterestCategoryDto, interestCategoryParamDto } from './requestDto';
import { createInterestCategorySchema } from './schema';
import { InterestCategoryController } from './controller';

import { isEmailValid, isUsernameValid } from "../../../common/Validation";

export default async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const { container } = fastify;
  const sessionManager = await container.resolve(SessionManagerService);

  const interestCategoryController = new InterestCategoryController(fastify);
  await interestCategoryController.initialize();

  fastify.post<{ Body: createInterestCategoryDto }>(
    "/create",
    {
      schema: createInterestCategorySchema,
      // preHandler: [sessionManager.sessionPreHandler],
    },
    interestCategoryController.createInterestCategory
  );

  fastify.get(
    "/read",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ]
    },
    interestCategoryController.readInterestCategories
  );

  fastify.put<{ Body: createInterestCategoryDto; Params: interestCategoryParamDto; }>(
    "/update/:id",
    {
      schema: createInterestCategorySchema,
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    interestCategoryController.updateInterestCategory
  );

  fastify.delete<{ Params: interestCategoryParamDto }>(
    "/delete/:id",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    interestCategoryController.deleteInterestCategory
  );
}

