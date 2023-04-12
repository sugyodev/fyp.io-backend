import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { FastifyRequest } from "fastify";
import {
	File,
	GetDestination,
	GetFileName,
	StorageEngine,
} from "fastify-multer/lib/interfaces";
import crypto from "node:crypto";
import { join } from "node:path";
import stream from "node:stream";
import fileType from "file-type";

const autoContentType = (
	_req: FastifyRequest,
	file: File,
	cb: (error: Error | null, mime?: string, stream?: stream.Readable) => void
) => {
	file.stream!.once("data", async function (firstChunk) {
		const type = await fileType.fileTypeFromStream(firstChunk);
		let mime = "application/octet-stream"; // default type

		// // Make sure to check xml-extension for svg files.
		// if ((!type || type.ext === 'xml') && isSvg(firstChunk.toString())) {
		//   mime = 'image/svg+xml'
		// } else if (type) {
		//   mime = type.mime
		// }
		if (type) {
			mime = type.mime;
		}

		const outStream = new stream.PassThrough();

		outStream.write(firstChunk);
		file.stream!.pipe(outStream);

		cb(null, mime, outStream);
	});
};

const getFilename: GetFileName = (_req, _file, cb) => {
	crypto.randomBytes(16, function (err, raw) {
		cb(err, err ? undefined : raw.toString("hex"));
	});
};

const getDestination: GetDestination = (_req, _file, cb) => {
	cb(null, crypto.randomBytes(8).toString("base64url"));
};

export interface S3StorageOptions {
	s3: S3Client;
	bucket: string;
	/** A function used to determine within which folder the uploaded files should be stored. Defaults to the system's default temporary directory. */
	destination?: string | GetDestination;
	/** A function used to determine what the file should be named inside the folder. Defaults to a random name with no file extension. */
	filename?: GetFileName;
}

export default class S3Storage implements StorageEngine {
	s3: S3Client;
	bucket: string;
	getFilename: GetFileName;
	getDestination: GetDestination;

	constructor(opts: S3StorageOptions) {
		this.s3 = opts.s3;
		this.bucket = opts.bucket;
		this.getFilename = opts.filename || getFilename;

		if (typeof opts.destination === "string") {
			this.getDestination = function (_req, _file, cb) {
				cb(null, opts.destination as string);
			};
		} else {
			this.getDestination = opts.destination || getDestination;
		}
	}

	_handleFile(
		req: FastifyRequest,
		file: File,
		cb: (
			error?: Error | null | undefined,
			info?: Partial<File> | undefined
		) => void
	): void {
		this.getDestination(req, file, (err, destination) => {
			if (err) {
				return cb(err);
			}

			this.getFilename(req, file, (error, filename) => {
				if (error) {
					return cb(error);
				}

				if (!file.stream) return cb(new Error("stream is null"));

				autoContentType(req, file, (err, mime, stream) => {
					const finalPath = join(destination, filename!);
					let size = 0;

					const outStream = new Upload({
						client: this.s3,
						params: {
							Bucket: this.bucket,
							Key: finalPath,
							Body: stream,
						},
						leavePartsOnError: false,
					});

					outStream.on("httpUploadProgress", (progress) => {
						if (progress.total) size = progress.total;
					});

					outStream
						.done()
						.then(() => {
							cb(null, {
								destination,
								filename,
								path: finalPath,
								size,
							});
						})
						.catch((err) => {
							cb(err);
						});
				});
			});
		});
	}

	_removeFile(
		req: FastifyRequest,
		file: File,
		callback: (error?: Error | null | undefined) => void
	): void {
		const path = file.path;
		if (!path) return callback();

		this.s3
			.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: path,
				})
			)
			.then(() => {
				callback();
			})
			.catch((err) => {
				callback(err);
			});
	}
}
