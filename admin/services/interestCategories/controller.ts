import { Container } from 'async-injection';
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';

import { SessionManagerService } from '../../../common/service/SessionManagerService';
import { DataSourceService } from '../../../common/service/DataSourceService';
import SnowflakeService from '../../../common/service/SnowflakeService';

import { createInterestCategoryDto, interestCategoryParamDto } from './requestDto';
import { DataInterestCategory } from '../../../common/database/entities/DataInterestCategory';

export class InterestCategoryController {
  fastify: FastifyInstance;
  container: Container;
  sessionManager: SessionManagerService;
  snowflake: SnowflakeService;
  dataSource: DataSourceService;
  interestCategoryRepo: Repository<DataInterestCategory>

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.container = fastify.container;
  }

  public initialize = async () => {
    this.sessionManager = await this.container.resolve(SessionManagerService);
    this.snowflake = await this.container.resolve(SnowflakeService);
    this.dataSource = await this.container.resolve(DataSourceService);
    this.interestCategoryRepo = this.dataSource.getRepository(DataInterestCategory);
  }

  public createInterestCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, description } = request.body as createInterestCategoryDto;
      const interestCategory = new DataInterestCategory();
      interestCategory.id = this.snowflake.genStr();
      interestCategory.name = name;
      interestCategory.description = description;
      await this.interestCategoryRepo.save(interestCategory)
      return reply.send({
        message: "Successfully registered",
      });
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public readInterestCategories = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await this.interestCategoryRepo.find();
      return reply.send({
        data: res,
        message: "Successfully readed"
      })
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public updateInterestCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as interestCategoryParamDto;
      const { name, description } = request.body as createInterestCategoryDto;

      const interestCategory = new DataInterestCategory();
      interestCategory.id = this.snowflake.genStr();
      interestCategory.name = name;
      interestCategory.description = description ?? "";

      await this.interestCategoryRepo.update({ id: id.toString() }, interestCategory);
      return reply.send({
        message: "Successfully updated"
      });
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public deleteInterestCategory = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as interestCategoryParamDto;
      const res = await this.interestCategoryRepo.delete({ id: id.toString() });
      return reply.send({
        message: "Successfully deleted"
      })
    } catch (err) {
      console.log("err------------>", err);
    }
  }

}

