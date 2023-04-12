import crypto from "node:crypto";

export async function generatePasswordHashSalt(
	password: string
): Promise<string> {
	password = password.normalize();
	const salt = crypto.randomBytes(16);
	return new Promise((resolve, reject) => {
		crypto.scrypt(Buffer.from(password, "utf-8"), salt, 64, (err, hash) => {
			if (err) return reject(err);

			resolve(
				hash.toString("base64url") + "." + salt.toString("base64url")
			);
		});
	});
}

export enum VerifyPasswordResult {
	OK,
	INVALID_PAYLOAD,
	INVALID_PASSWORD,
}

export async function verifyPassword(
	password: string,
	hashSaltPayload: string
): Promise<VerifyPasswordResult> {
	password = password.normalize();
	const passBuf = Buffer.from(password, "utf-8");
	const [hash, salt] = hashSaltPayload.split(".");

	if (!hash || !salt) return VerifyPasswordResult.INVALID_PAYLOAD;

	try {
		const hashBuf = Buffer.from(hash, "base64url");
		const saltBuf = Buffer.from(salt, "base64url");

		return new Promise((resolve, reject) => {
			crypto.scrypt(passBuf, saltBuf, 64, (err, hash) => {
				if (err) return reject(err);
				resolve(
					hashBuf.equals(hash)
						? VerifyPasswordResult.OK
						: VerifyPasswordResult.INVALID_PASSWORD
				);
			});
		});
	} catch (e) {
		return VerifyPasswordResult.INVALID_PAYLOAD;
	}
}
