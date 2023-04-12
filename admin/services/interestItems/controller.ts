import { Container } from 'async-injection';
import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
import { DataInterestItem } from '../../../common/database/entities/DataInterestItem';
import { DataSourceService } from '../../../common/service/DataSourceService';
import { SessionManagerService } from '../../../common/service/SessionManagerService';

import SnowflakeService from '../../../common/service/SnowflakeService';

import { createInterestItemDto, interestItemParamDto } from './requestDto';


export class InterestItemController {
  fastify: FastifyInstance;
  container: Container;
  sessionManager: SessionManagerService;
  snowflake: SnowflakeService;
  dataSource: DataSourceService;
  interestItemRepo: Repository<DataInterestItem>

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.container = fastify.container;
  }

  public initialize = async () => {
    this.sessionManager = await this.container.resolve(SessionManagerService);
    this.snowflake = await this.container.resolve(SnowflakeService);
    this.dataSource = await this.container.resolve(DataSourceService);
    this.interestItemRepo = this.dataSource.getRepository(DataInterestItem);
  }

  public createInterestItem = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { name, description } = request.body as createInterestItemDto;
      const interestItem = new DataInterestItem();
      interestItem.id = this.snowflake.genStr();
      interestItem.name = name;
      interestItem.description = description;
      await this.interestItemRepo.save(interestItem)
      return reply.send({
        message: "Successfully registered",
      });
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public readInterestItems = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const res = await this.interestItemRepo.find();
      return reply.send({
        data: res,
        message: "Successfully readed"
      })
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public updateInterestItem = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as interestItemParamDto;
      const { name, description } = request.body as createInterestItemDto;

      const interestItem = new DataInterestItem();
      interestItem.id = this.snowflake.genStr();
      interestItem.name = name;
      interestItem.description = description ?? "";

      await this.interestItemRepo.update({ id: id.toString() }, interestItem);
      return reply.send({
        message: "Successfully updated"
      });
    } catch (err) {
      console.log("err------------>", err);
    }
  }

  public deleteInterestItem = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id } = request.params as interestItemParamDto;
      const res = await this.interestItemRepo.delete({ id: id.toString() });
      return reply.send({
        message: "Successfully deleted"
      })
    } catch (err) {
      console.log("err------------>", err);
    }
  }

}

