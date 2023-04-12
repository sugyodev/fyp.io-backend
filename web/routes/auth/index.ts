import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ILike } from "typeorm";
import APIErrors, { sendError } from "../../../common/APIErrors";
import { User } from "../../../common/database/entities/User";
import { DataSourceService } from "../../../common/service/DataSourceService";
import { SessionManagerService } from "../../../common/service/SessionManagerService";
import { isEmailValid, isUsernameValid } from "../../../common/Validation";

import pwdStrength from "pwd-strength";
import {
	generatePasswordHashSalt,
	verifyPassword,
	VerifyPasswordResult,
} from "../../../common/auth/Hashing";
import { Profile } from "../../../common/database/entities/Profile";
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

	fastify.post<{
		Body: {
			email: string;
			linkname?: string;
			password: string;
		};
	}>(
		"/password/register",
		{
			config: {
				ratelimit: {
					// todo
				},
			},
			schema: {
				body: {
					type: "object",
					properties: {
						email: { type: "string" },
						linkname: { type: "string" },
						password: { type: "string" },
					},
					required: ["email", "password"],
				},
			},
			preHandler: [sessionManager.sessionPreHandler],
		},
		async (request, reply) => {
			if (request.session) {
				return sendError(reply, APIErrors.ALREADY_AUTHORIZED);
			}

			const { email, linkname, password } = request.body;
			if (linkname != undefined && !isUsernameValid(linkname)) {
				return sendError(reply, APIErrors.REGISTER_INVALID_LINKNAME);
			}

			if (!isEmailValid(email)) {
				return sendError(reply, APIErrors.REGISTER_INVALID_EMAIL);
			}

			const strengthCheck = pwdStrength(password);

			if (!strengthCheck.success) {
				return sendError(
					reply,
					APIErrors.REGISTER_INVALID_PASSWORD(strengthCheck.message)
				);
			}

			const existingUserByEmail = await userRepo.findOne({
				where: {
					email: ILike(email),
				},
			});
			if (existingUserByEmail) {
				return sendError(reply, APIErrors.REGISTER_EMAIL_IN_USE);
			}

			if (linkname) {
				const existingProfileByLinkname = await profileRepo.findOne({
					where: {
						linkname: ILike(linkname),
					},
				});

				if (existingProfileByLinkname) {
					return sendError(
						reply,
						APIErrors.CLAIM_USERNAME_ERROR(
							"Username already in use"
						)
					);
				}
			}
			
			const user = new User();
			user.id = snowflake.genStr();
			user.email = email;
			user.passwordHash = await generatePasswordHashSalt(password);


			dataSource.transaction(async (manager) => {
				const userRepo = manager.getRepository(User);
				const profileRepo = manager.getRepository(Profile);
				
				await userRepo.save(user);

				if (linkname) {
					const profile = new Profile();
					profile.id = snowflake.genStr();
					profile.linkname = linkname;
					profile.owner = user;
					await profileRepo.save(profile);
				}
			});

			const session = await sessionManager.createSessionForUser(user.id);

			return reply.send({
				token: session.createToken(),
			});
		}
	);

	fastify.post<{
		Body: {
			email: string;
			password: string;
		};
	}>(
		"/password/login",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						email: { type: "string" },
						password: { type: "string" },
					},
					required: ["email", "password"],
				},
			},
		},
		async (request, reply) => {
			const { email, password } = request.body;

			const user = await userRepo.findOneBy({
				email,
			});

			if (!user || !user.passwordHash) {
				return sendError(reply, APIErrors.LOGIN_INVALID_CREDENTIALS);
			}

			const result = await verifyPassword(password, user.passwordHash);
			if (result === VerifyPasswordResult.OK) {
				const session = await sessionManager.createSessionForUser(
					user.id
				);

				return reply.send({
					token: session.createToken(),
				});
			} else {
				return sendError(reply, APIErrors.LOGIN_INVALID_CREDENTIALS);
			}
		}
	);

	fastify.post<{
		Body: {};
	}>(
		"/logout",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		async (request, reply) => {
			request.session?.destroy();

			return reply.send({});
		}
	);

	fastify.post<{
		Body: {
			link: string;
			proposedNames: string[];
		};
	}>(
		"/link-availability",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						link: { type: "string" },
					},
					required: ["link"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							available: { type: "boolean" },
							proposedNames: {
								type: "array",
								items: { type: "string" },
							},
						},
					},
				},
			},
		},
		async (request, reply) => {
			const { link } = request.body;

			const user = await profileRepo.findOneBy({
				linkname: ILike(link),
			});

			const proposedNames: string[] = []; // todo

			return reply.send({
				available: !user,
				proposedNames,
			});
		}
	);

	fastify.get(
		"/user-info",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		async (request, reply) => {
			const session = request.session!;
			const user = await session.getUser(userRepo);

			return reply.send({
				user: {
					id: user.id,
					email: user.email,
				},
			});
		}
	);
}
