import { Container } from "async-injection";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { Repository } from "typeorm";

import { DataSourceService } from "../../../common/service/DataSourceService";
import { SessionManagerService } from "../../../common/service/SessionManagerService";
import SnowflakeService from "../../../common/service/SnowflakeService";

import { Profile } from "../../../common/database/entities/Profile";

import { User } from "../../../common/database/entities/User";
import { setCategoriesDto } from "../profilex/requestDto/templateRequestDto";

export class ProfileController {
	fastify: FastifyInstance;
	container: Container;
	sessionManager: SessionManagerService;
	snowflake: SnowflakeService;
	dataSource: DataSourceService;

	userRepo: Repository<User>;
	profileRepo: Repository<Profile>;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
		this.container = fastify.container;
	}

	public initialize = async () => {
		this.sessionManager = await this.container.resolve(
			SessionManagerService
		);
		this.dataSource = await this.container.resolve(DataSourceService);
		this.snowflake = await this.container.resolve(SnowflakeService);

		this.userRepo = this.dataSource.getRepository(User);
		this.profileRepo = this.dataSource.getRepository(Profile);
	};

	public getProfiles = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const session = request.session!;
		const user = await session.getUser(this.userRepo);

		const users = await this.profileRepo.findOne({
			where: {
				id: user.id,
			},
			relations: {},
		});

		return reply.send({
			user: users,
		});
	};

	public setProfiles = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {};

	public setCategories = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const { categories } = request.body as setCategoriesDto;

		return reply.send({
			message: "successfully ",
		});
	};

	public getCategories = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {};

	public setTemplate = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {};
}
