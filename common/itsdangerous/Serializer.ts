/**
 * Base Serializer class and factory
 *
 * @module serializer
 */

import Json, { SerializerLike } from "./internal/Json";

import { Signer, SignerOptions } from "./Signer";

import { BadPayload } from "./Error";

/**
 * Serializer Options
 * @typedef {object} SerializerOptions
 * @property {string} [salt="itsdanger.Serializer"] - Value to salt signature
 * @property {import('./_json').SerializerLike} [serializer=Json] - Signed value delimiter
 * @property {Signer} [signer=Signer] - Method for deriving signing secret
 * @property {import('./signer').SigningOptions} [signerOptions] - Options to pass to {@link Signer}
 */
export interface SerializerOptions {
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
 * Base Serializing class for subclassing
 */
export class BaseSerializer {
	secretKey: string;
	salt: string;
	serializer: SerializerLike;
	signer: typeof Signer;
	signerOptions: SignerOptions;
    signerArgs: any;

	/**
	 * @param {string} secretKey
	 * @param {SerializerOptions} [options]
	 */
	constructor(
		secretKey: string,
		{
			salt = "itsdanger.Serializer",
			serializer = Json,
			signer = Signer,
			signerOptions = {},
		}: SerializerOptions = {}
	) {
		this.secretKey = secretKey;

		this.salt = salt;
		this.serializer = serializer;

		this.signer = signer;
		this.signerOptions = signerOptions;
	}

	makeSigner(salt?: string) {
		salt = salt || this.salt;
		return new this.signer(this.secretKey, { ...this.signerOptions, salt });
	}

	dumpPayload(obj: any) {
		return this.serializer.dumps(obj);
	}

	loadPayload(payload: any, serializer?: SerializerLike): any {
		try {
			return (serializer || this.serializer).loads(payload);
		} catch (error) {
			throw new BadPayload(
				"Could not load the payload because an exception occurred on unserializing the data.",
				error
			);
		}
	}

	dumps(value: any, salt?: string) {
		return this.makeSigner(salt).sign(this.dumpPayload(value));
	}

	loads(
		value: string,
		maxAge?: number,
		returnTimestamp = false,
		salt?: string
	)  {
		return this.loadPayload(this.makeSigner(salt).unsign(value));
	}
}

/**
 *
 * @type {(secretKey: string, options?: SerializerOptions) => BaseSerializer}
 */
export const Serializer = (secretKey: string, options?: SerializerOptions) =>
	new BaseSerializer(secretKey, options);
