import { FastifyInstance, FastifyPluginOptions } from "fastify";

import { SessionManagerService } from "../../../common/service/SessionManagerService";

import { ProfileController } from "./controllers/templateController";

import {
	getLinkInfoDto,
	setAccountDto,
	setCategoriesDto,
	setTemplateDto,
} from "./requestDto/templateRequestDto";

export default async function routes(
	fastify: FastifyInstance,
	options: FastifyPluginOptions
) {
	const { container } = fastify;

	const profileController = new ProfileController(fastify);
	await profileController.initialize();

	const sessionManager = await container.resolve(SessionManagerService);

	fastify.get(
		"/info",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.getProfiles
	);

	fastify.post<{ Body: setCategoriesDto }>(
		"/set-categories",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.setCategories
	);

	fastify.post<{ Body: setAccountDto }>(
		"/save-account",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.updateAccount
	);

	fastify.post<{ Body: setTemplateDto }>(
		"/save-template",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.updateTemplate
	);

	fastify.post<{ Body: getLinkInfoDto }>(
		"/get-link-info",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.getLinkInfo
	);

	fastify.post(
		"/avatar",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
				// avatarUpload.single("avatar"),
			],
		},
		profileController.uploadAvatar
	);

	fastify.delete(
		"/avatar",
		{
			preHandler: [
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.deleteAvatar
	);

	fastify.post(
		"/carousels",
		{
			preHandler: [
				// carouselUpload.fields([
				// 	{
				// 		name: "carouselImage[]",
				// 		maxCount: 6,
				// 	},
				// ]),
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.uploadCarousel
	);

	fastify.delete(
		"/carousels",
		{
			preHandler: [
				// carouselUpload.fields([
				// 	{
				// 		name: "carouselImage[]",
				// 		maxCount: 6,
				// 	},
				// ]),
				sessionManager.sessionPreHandler,
				sessionManager.requireAuthHandler,
			],
		},
		profileController.deleteCarousel
	);
	// upload.single('avatar')
	// upload.array('photos', 12),
	// upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
	// upload.none(),
}
