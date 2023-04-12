import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { blackWordParamDto, createBlackWordDto } from './requestDto';
import { createBlackWordSchema } from './schema';
import { BlackWordController } from './controller';

import { isEmailValid, isUsernameValid } from "../../../common/Validation";

export default async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  const { container } = fastify;
  const sessionManager = await container.resolve(SessionManagerService);

  const blackWordController = new BlackWordController(fastify);
  await blackWordController.initialize();

  fastify.post<{ Body: createBlackWordDto }>(
    "/create",
    {
      schema: createBlackWordSchema,
      // preHandler: [sessionManager.sessionPreHandler],
    },
    blackWordController.createBlackWord
  );

  fastify.get(
    "/read",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ]
    },
    blackWordController.readBlackWord
  );

  fastify.put<{ Body: createBlackWordDto; Params: blackWordParamDto; }>(
    "/update/:id",
    {
      schema: createBlackWordSchema,
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    blackWordController.updateBlackWord
  );

  fastify.delete<{
    Params: blackWordParamDto
  }>(
    "/delete/:id",
    {
      // preHandler: [
      //   sessionManager.sessionPreHandler,
      //   sessionManager.requireAuthHandler,
      // ],
    },
    blackWordController.deleteBlackWord
  );
}

