import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Profile } from "../../../common/database/entities/Profile";
import { User } from "../../../common/database/entities/User";
import { DataSourceService } from "../../../common/service/DataSourceService";

import { SessionManagerService } from "../../../common/service/SessionManagerService";
import SnowflakeService from "../../../common/service/SnowflakeService";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const snowflake = await container.resolve(SnowflakeService);
	const dataSource = await container.resolve(DataSourceService);
	const sessionManager = await container.resolve(SessionManagerService);

	const userRepo = dataSource.getRepository(User);
	const profileRepo = dataSource.getRepository(Profile);
}
