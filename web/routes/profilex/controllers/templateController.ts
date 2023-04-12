import { Container } from "async-injection";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { Repository } from "typeorm";

import fs from "fs";
import { pipeline } from "stream";
import util from "util";

const pump = util.promisify(pipeline);

import { MAX_CAROUSEL_SIZE } from "../../../../helper/constant";

import { DataSourceService } from "../../../../common/service/DataSourceService";
import { SessionManagerService } from "../../../../common/service/SessionManagerService";
import SnowflakeService from "../../../../common/service/SnowflakeService";

import { Profile } from "../../../../common/database/entities/Profile";

import { User } from "../../../../common/database/entities/User";
import { UserAccount } from "../../../../common/database/entities/UserAccount";
import { UserTemplate } from "../../../../common/database/entities/UserTemplate";
import { ITemplate } from "../../../../helper/template/templateType";

import {
	getLinkInfoDto,
	setAccountDto,
	setCategoriesDto,
	setTemplateDto,
} from "../requestDto/templateRequestDto"

export class ProfileController {
	fastify: FastifyInstance;
	container: Container;
	sessionManager: SessionManagerService;
	snowflake: SnowflakeService;
	dataSource: DataSourceService;

	userRepo: Repository<User>;
	profileRepo: Repository<Profile>;
	accountRepo: Repository<UserAccount>;
	templateRepo: Repository<UserTemplate>;

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
		this.accountRepo = this.dataSource.getRepository(UserAccount);
		this.templateRepo = this.dataSource.getRepository(UserTemplate);
	};

	public getProfiles = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const session = request.session!;
		const user = await session.getUser(this.userRepo);

		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				account: true,
				template: true,
				socialPinnedLinks: true,
				embedLinks: true,
				customLinks: true,
			},
		});

		reply.send({
			profile: profile,
		});
	};

	public setCategories = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const { categories } = request.body as setCategoriesDto;
		const session = request.session;

		const user = await session?.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
		});
		if (profile) {
			profile.categories = categories;
			await this.profileRepo.save(profile);
		}
		reply.send({
			profile: profile,
		});
	};

	public updateAccount = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const data = request.body as setAccountDto;
		const session = request.session;

		const user = await session?.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				account: true,
			},
		});

		try {
			const account = profile?.account;
			if (account) {
				const id = account.id;
				await this.accountRepo.update({ id }, { ...account, ...data });

				reply.send({
					message: "Success",
					account: account,
				});
			} else {
				reply.send({
					message: "Account does not exist",
				});
			}
		} catch (err) {
			reply.send({
				message: "error",
				error: err,
			});
		}
	};

	public updateTemplate = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const data = request.body as ITemplate;
		const session = request.session;

		const user = await session?.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				template: true,
			},
		});

		try {
			let template = profile?.template;
			if (template) {
				const id = template.id;
        template = {...template, ...data};
				await this.templateRepo.update(
					{ id },
          template
					// { ...template, ...data }
				);

				reply.send({
					message: "Success",
					template: template,
				});
			} else {
				reply.send({
					message: "Template info doesn't exist",
				});
			}
		} catch (err) {
			reply.send({
				message: "err",
				error: err,
			});
		}
	};

	public uploadAvatar = async (request: any, reply: any) => {
		const session = request.session;
		const filename = request.file.filename;

		const user = await session?.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				account: true,
			},
		});

		try {
			const account = profile?.account;
			if (account) {
				const { id, avatarUrl } = account;
				if (avatarUrl) {
					const fileUrl = `uploads/${avatarUrl}`;
					if (fs.existsSync(fileUrl)) {
						fs.unlinkSync(fileUrl);
					}
				}
				account.avatarUrl = `avatars/${filename}`;
				await this.accountRepo.update({ id }, account);
				reply.send({
					message: "Success",
					account: account,
				});
			} else {
				reply.send({
					message: "error",
				});
			}
		} catch (err) {
			reply.send({
				message: "error",
				error: err,
			});
		}
	};

	public deleteAvatar = async (request: any, reply: any) => {
		const session = request.session;

		const user = await session?.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				account: true,
			},
		});

		try {
			const account = profile?.account;
			if (account) {
				const { id, avatarUrl } = account;
				if (avatarUrl) {
					const fileUrl = `uploads/${avatarUrl}`;
					if (fs.existsSync(fileUrl)) {
						fs.unlinkSync(fileUrl);
					}
					account.avatarUrl = null;
					await this.accountRepo.update({ id }, account);
					reply.send({
						message: "Success",
						account: account,
					});
				}
			} else {
				reply.send({
					message: "error",
				});
			}
		} catch (err) {
			reply.send({
				message: "error",
				error: err,
			});
		}
	};

	public uploadCarousel = async (request: any, reply: any) => {
		const session = request.session;

		const files: any[] = request.files["carouselImage[]"];

		const user = await session.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				template: true,
			},
		});

		try {
			const template = profile?.template;
			if (template) {
				const { id, carouselImageUrls } = template;
				let newUrls: string[] = carouselImageUrls
					? [...carouselImageUrls]
					: [];
				files.forEach((file) => {
					newUrls.push(`carousels/${file.filename}`);
				});
				newUrls = newUrls.filter((url, index) => {
					if (index < MAX_CAROUSEL_SIZE) {
						return url;
					} else {
						const fileUrl = `uploads/${url}`;
						if (fs.existsSync(fileUrl)) {
							fs.unlinkSync(fileUrl);
						}
					}
				});
				template.carouselImageUrls = newUrls;
				await this.templateRepo.update({ id }, template);
				reply.send({
					message: "Success",
					template: template,
				});
			} else {
				reply.send({
					message: "err",
				});
			}
		} catch (err) {
			reply.send({
				message: "err",
				error: err,
			});
		}
	};

	public deleteCarousel = async (request: any, reply: any) => {
		const session = request.session;
		const imageUrl = request.body.imageUrl;

		const user = await session.getUser(this.userRepo);
		const profile = await this.profileRepo.findOne({
			where: {
				owner: user,
			},
			relations: {
				template: true,
			},
		});

		try {
			const template = profile?.template;
			if (template) {
				const { id, carouselImageUrls } = template;
				let newUrls: string[] = carouselImageUrls
					? [...carouselImageUrls]
					: [];

				newUrls = newUrls.filter((url) => {
					if (url != imageUrl) {
						return url;
					} else {
						const fileUrl = `uploads/${url}`;
						if (fs.existsSync(fileUrl)) fs.unlinkSync(fileUrl);
					}
				});

				template.carouselImageUrls = newUrls;
				await this.templateRepo.update({ id }, template);
				reply.send({
					message: "Success",
					template: template,
				});
			} else {
				reply.send({
					message: "err",
				});
			}
		} catch (err) {
			reply.send({
				message: "err",
				error: err,
			});
		}
	};

	public getLinkInfo = async (
		request: FastifyRequest,
		reply: FastifyReply
	) => {
		const { linkname } = request.body as getLinkInfoDto;

		const profile = await this.profileRepo.findOne({
			where: {
				linkname: linkname,
			},
			relations: {
				account: true,
				template: true,
        socialPinnedLinks: true,
        customLinks: true
			},
		});

		reply.send({
			message: "Success",
			profile: profile,
		});
	};
}
