import { Injectable } from "async-injection";
import { S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service extends S3Client {}

export async function s3ServiceFactory(): Promise<S3Service> {
	const region = process.env.S3_REGION;
	const endpoint = process.env.S3_ENDPOINT;
	const accessKeyId = process.env.S3_ACCESS_KEY_ID;
	const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

	if (!region) throw new Error("S3_REGION is not set");
	if (!endpoint) throw new Error("S3_ENDPOINT is not set");
	if (!accessKeyId) throw new Error("S3_ACCESS_KEY_ID is not set");
	if (!secretAccessKey) throw new Error("S3_SECRET_ACCESS_KEY is not set");

	const s3Service = new S3Service({
		region,
		endpoint,
		credentials: {
			accessKeyId,
			secretAccessKey,
		},
	});

	return s3Service;
}
