import { Container } from "async-injection";
import {
	FastifyError,
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import { Repository } from "typeorm";

import { SessionManagerService } from "../../../common/service/SessionManagerService";
import { DataSourceService } from "../../../common/service/DataSourceService";
import SnowflakeService from "../../../common/service/SnowflakeService";

import { BlackWord } from "../../../common/database/entities/BlackWord";

import { blackWordParamDto, createBlackWordDto } from "./requestDto";

export class BlackWordController {
	fastify: FastifyInstance;
	container: Container;
	sessionManager: SessionManagerService;
	snowflake: SnowflakeService;
	dataSource: DataSourceService;
	blackWordRepo: Repository<BlackWord>;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
		this.container = fastify.container;
	}

	public initialize = async () => {
		this.sessionManager = await this.container.resolve(
			SessionManagerService
		);
		this.snowflake = await this.container.resolve(SnowflakeService);
		this.dataSource = await this.container.resolve(DataSourceService);
		this.blackWordRepo = this.dataSource.getRepository(BlackWord);
	};

	public createBlackWord = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		try {
			const { type, name, description } =
				request.body as createBlackWordDto;
			const blackWord = new BlackWord();
			blackWord.id = this.snowflake.genStr();
			blackWord.name = name;
			blackWord.type = type;
			blackWord.description = description;
			await this.blackWordRepo.save(blackWord);
			return reply.send({
				message: "Successfully registered",
			});
		} catch (err) {
			console.log("err------------>", err);
		}
	};

	public readBlackWord = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		try {
			const res = await this.blackWordRepo.find();
			return reply.send({
				data: res,
				message: "Successfully readed",
			});
		} catch (err) {
			console.log("err------------>", err);
		}
	};

	public updateBlackWord = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		try {
			const { id } = request.params as blackWordParamDto;
			const { type, name, description } =
				request.body as createBlackWordDto;

			const blackWord = new BlackWord();
			blackWord.id = this.snowflake.genStr();
			blackWord.type = type;
			blackWord.name = name;
			blackWord.description = description ?? "";

			await this.blackWordRepo.update({ id: id.toString() }, blackWord);
			return reply.send({
				message: "Successfully updated",
			});
		} catch (err) {
			console.log("err------------>", err);
		}
	};

	public deleteBlackWord = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		try {
			const { id } = request.params as blackWordParamDto;
			const res = await this.blackWordRepo.delete({ id: id.toString() });
			return reply.send({
				message: "Successfully deleted",
			});
		} catch (err) {
			console.log("err------------>", err);
		}
	};  
}
