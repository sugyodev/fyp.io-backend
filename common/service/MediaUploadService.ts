import { Injectable, Injector } from "async-injection";
import { S3Service } from "./S3Service";
import multer from "fastify-multer";
import S3Storage from "../utils/FastifyMulterS3";
import SnowflakeService from "./SnowflakeService";

type Multer = ReturnType<typeof multer>;

@Injectable()
export class MediaUpload {
	readonly #snowflake: SnowflakeService;
	readonly #s3: S3Service;
	readonly #bucket: string;
	readonly #multers: Map<string, Multer>;

	constructor(snowflake: SnowflakeService, s3: S3Service, bucket: string) {
		this.#snowflake = snowflake;
		this.#s3 = s3;
		this.#bucket = bucket;
	}

	getMulter(name: string): Multer {
		if (this.#multers.has(name)) {
			return this.#multers.get(name)!;
		}

		const upload = multer({
			storage: new S3Storage({
				s3: this.#s3,
				bucket: this.#bucket,
				destination: `ugc/${name}/`,
				filename: (req, file, cb) => {
					const ext = file.originalname.split(".").pop();
					cb(null, `${this.#snowflake.genStr()}.${ext}`);
				},
			}),
		});

		this.#multers.set(name, upload);

		return upload;
	}
}

export async function mediaUploadFactory(
	injector: Injector
): Promise<MediaUpload> {
	const s3 = await injector.resolve(S3Service);
	const snowflake = await injector.resolve(SnowflakeService);

	const bucket = process.env.S3_BUCKET;
	if (!bucket) throw new Error("S3_BUCKET is not set");

	const mediaCDN = new MediaUpload(snowflake, s3, bucket);

	return mediaCDN;
}
