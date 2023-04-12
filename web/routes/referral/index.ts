import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Logger } from "pino";

import APIErrors, { sendError } from "../../../common/APIErrors";
import { User } from "../../../common/database/entities/User";
import { Profile } from "../../../common/database/entities/Profile";
import { ReferralPremium } from "../../../common/database/entities/ReferralPremium";
import { ReferralService } from "../../../common/service/ReferralService";
import { DataSourceService } from "../../../common/service/DataSourceService";
import { SessionManagerService } from "../../../common/service/SessionManagerService";
import SnowflakeService from "../../../common/service/SnowflakeService";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const referralService = await container.resolve(ReferralService);

	const logger = await container.resolve<Logger>("logger");

	const snowflake = await container.resolve(SnowflakeService);
	const dataSource = await container.resolve(DataSourceService);
	const sessionManager = await container.resolve(SessionManagerService);

	const userRepo = dataSource.getRepository(User);
	const profileRepo = dataSource.getRepository(Profile);
	const referralPremiumRepo = dataSource.getRepository(ReferralPremium);

	fastify.post<{
		Body: {
			referralUrl: string;
		};
	}>(
		"/validate",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						referralUrl: { type: "string" },
					},
					required: ["referralUrl"],
				},
			},
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		async (request, reply) => {
			const { referralUrl } = request.body;

			const session = request.session!;
			const user = await session.getUser(userRepo);
			const profile = await profileRepo.findOneBy({
				owner: user,
			});

			if (!profile) {
				return reply.status(400).send({
					message: "You must have a profile to use this feature",
				});
			}

			const referralPremium = await referralPremiumRepo.findOneBy({
				owner: user,
			});

			if (referralPremium?.status === "active") {
				return reply.status(400).send({
					message: "Referral program is already activated",
				});
			}

			let response;
			try {
				response = await referralService.validateReferralUrl(
					referralUrl,
					profile!.linkname
				);
			} catch (error) {
				logger.error("Failed to validate referral URL", error);
				return sendError(reply, APIErrors.GENERIC_ERROR);
			}

			if (!process.env.REFERRAL_MIN_FOLLOWERS) {
				throw new Error("Missing REFERRAL_MIN_FOLLOWERS");
			}

			const minFollowers = parseInt(process.env.REFERRAL_MIN_FOLLOWERS);

			if (response.data.followers < minFollowers) {
				return reply.status(400).send({
					message: `Must have over ${process.env.REFERRAL_MIN_FOLLOWERS} followers on your social media to enter this program`,
				});
			}

			if (!response.data.isValid) {
				return reply.status(400).send({
					message: "Unable to locate bio link to your profile",
				});
			}

			if (referralPremium) {
				referralPremium.socialUrl = request.body.referralUrl;
				referralPremium.followers = response.data.followers;
				referralPremium.status = "active";
				await referralPremiumRepo.save(referralPremium);
			} else {
				const newReferralPremium = new ReferralPremium();
				newReferralPremium.id = snowflake.genStr();
				newReferralPremium.socialUrl = request.body.referralUrl;
				newReferralPremium.followers = response.data.followers;
				newReferralPremium.status = "active";
				newReferralPremium.startPremiumAt = new Date().getTime();
				newReferralPremium.profile = profile;
				newReferralPremium.owner = user;
				await referralPremiumRepo.save(newReferralPremium);
			}

			return reply.send({
				message: "Successfully gave you premium",
			});
		}
	);

	fastify.get("/users", {
		preHandler: [
			async (request, reply) => {
				const API_KEY = request.headers["x-api-key"];

				if (!API_KEY || API_KEY !== process.env.REFERRAL_API_KEY) {
					return reply.status(401).send({
						message: "Unauthorized access",
					});
				}
			},
		],
		handler: async (request, reply) => {
			try {
				const referralPremiums = await referralPremiumRepo.find({
					where: {
						status: "active",
					},
					relations: ["profile"],
				});

				const data = referralPremiums.map((referralPremium) => {
					return {
						id: referralPremium.id,
						socialUrl: referralPremium.socialUrl,
						linkname: referralPremium.profile.linkname,
					};
				});

				return reply.send(data);
			} catch (error) {
				logger.error(
					"Failed to retrieve users with referral premium",
					error
				);
				return sendError(reply, APIErrors.GENERIC_ERROR);
			}
		},
	});

	fastify.get<{
		Params: {
			referralId: string;
		};
	}>("/:referralId/terminate", {
		preHandler: [
			async (request, reply) => {
				const API_KEY = request.headers["x-api-key"];

				if (!API_KEY || API_KEY !== process.env.REFERRAL_API_KEY) {
					return reply.status(401).send({
						message: "Unauthorized access",
					});
				}
			},
		],
		handler: async (request, reply) => {
			const { referralId } = request.params;

			let referralPremium;
			try {
				referralPremium = await referralPremiumRepo.findOneOrFail({
					where: {
						id: referralId,
						status: "active",
					},
				});
			} catch (error) {
				return reply.status(404).send({
					message: "Referral program not found for the given user id",
				});
			}

			referralPremium.status = "inactive";
			await referralPremiumRepo.save(referralPremium);

			return reply.send({
				message: "Referral program stopped successfully",
			});
		},
	});
}
