/**
 * Time-based Signer and Serializer classes + factories
 */

import Json, { SerializerLike } from "./internal/Json";
import Time from "./internal/Time";

import { BaseSerializer } from "./Serializer";
import { BaseSigner, Signer, SignerOptions } from "./Signer";

import { SigningAlgorithm } from "./Algorithms";
import { URLSafeBase64DecodeInt, URLSafeBase64EncodeInt } from "./Encoding";
import { BadTimeSignature, SignatureExpired } from "./Error";
import { required, rsplit } from "./Utils";

export interface TimestampSignerOptions extends SignerOptions {
	time?: typeof Time;
}

export class BaseTimestampSigner extends BaseSigner {
	inner: Signer;
	secretKey: string;
	salt: string;
	sep: string;
	keyDerivation: string;
	digestMethod: string;
	algorithm: SigningAlgorithm;
	time: typeof Time;

	constructor(
		secretKey: string = required("secretKey"),
		{
			salt = "itsdanger.Signer",
			sep = ".",
			keyDerivation = "django-concat",
			digestMethod = "sha1",
			algorithm,
			time = Time,
		}: TimestampSignerOptions = {}
	) {
		super(secretKey, { salt, sep, keyDerivation, digestMethod, algorithm });

		this.time = time;
	}

	getTimestamp() {
		return this.time.toTimestamp();
	}

	timestampToDate(timestamp: number) {
		return this.time.fromTimestamp(timestamp);
	}

	sign(value: string) {
		return super.sign(
			`${value}${this.sep}${URLSafeBase64EncodeInt(this.getTimestamp())}`
		);
	}

	unsign(signedValue: string, maxAge: number, returnTimestamp = false) {
		const result = Signer.prototype.unsign.call(this, signedValue);

		if (!result.includes(this.sep)) {
			throw new BadTimeSignature("timestamp missing", result);
		}

		let [value, timestampVal] = rsplit(result, this.sep);

		const timestamp = URLSafeBase64DecodeInt(timestampVal!);

		if (maxAge) {
			const age = this.getTimestamp() - timestamp;

			if (age > maxAge) {
				throw new SignatureExpired(
					`Signature age ${age} > ${maxAge} seconds`,
					value,
					this.timestampToDate(timestamp)
				);
			}
		}

		if (returnTimestamp) {
			return [value, this.timestampToDate(timestamp)];
		}

		return [value];
	}

	validate(signedValue: string, maxAge: number) {
		try {
			this.unsign(signedValue, maxAge);
			return true;
		} catch (error) {
			return false;
		}
	}
}

/**
 *
 * @param {string} secretKey
 * @param {object} options
 * @param {string} [options.salt=itsdanger.Signer]
 * @param {string} [options.sep=.]
 * @param {string} [options.keyDerivation=django-concat]
 * @param {string} [options.digestMethod=sha1]
 * @param {function} [options.algorithm=HmacAlgorithm]
 */
export class TimestampSigner extends BaseTimestampSigner {};

export class BaseTimedSerializer extends BaseSerializer {
	constructor(
		secretKey: string = required("secretKey"),
		{
			salt = "itsdanger.Serializer",
			serializer = Json,
			signerArgs = {},
		} = {}
	) {
		super(secretKey, {
			salt,
			serializer,
			signer: TimestampSigner as any,
			signerArgs,
		});
	}

	loads(
		signedValue: string,
		maxAge: number,
		returnTimestamp = false,
		salt?: string
	) {
		const signer = super.makeSigner(salt);

		const [value, timestamp] = (
			signer as any as BaseTimestampSigner
		).unsign(signedValue, maxAge, true);
		const payload = this.loadPayload(value);

		if (returnTimestamp) {
			return [payload, timestamp];
		}

		return payload;
	}
}

export interface TimedSerializerOptions {
	salt?: string;
	serializer?: SerializerLike;
	signer?: typeof Signer;
	signerOptions?: SignerOptions;
	signerArgs?: {
		sep?: string;
		keyDerivation?: string;
		digestMethod?: string;
	};
}

/**
 *
 * @param {string} secretKey
 * @param {object} options
 * @param {string} [options.salt='itsdanger.Serializer']
 * @param {function} [options.serializer=Json]
 * @param {object} [options.signerArgs]
 * @param {string} [options.signerArgs.sep]
 * @param {string} [options.signerArgs.keyDerivation]
 * @param {string} [options.signerArgs.digestMethod]
 * @param {function} [options.signerArgs.algorithm]
 */
export class TimedSerializer extends BaseTimedSerializer {};
