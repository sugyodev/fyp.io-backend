import { BaseSerializer, SerializerOptions } from "./Serializer";
import { BaseTimedSerializer, TimestampSignerOptions } from "./Timed";

import { URLSafeBase64Decode, URLSafeBase64Encode } from "./Encoding";

import { SerializerLike } from "./internal/Json";
import { required } from "./Utils";

const URLSafeSerializerMixin = (Base: any) =>
	class extends Base {
		constructor(
			secretKey: string = required("secretKey"),
			{ salt, serializer, signer, signerArgs }: any = {}
		) {
			super(secretKey, { salt, serializer, signer, signerArgs });
		}

		dumpPayload(obj: any) {
			return URLSafeBase64Encode(super.dumpPayload(obj));
		}

		loadPayload(payload: any, serializer: SerializerLike) {
			return super.loadPayload(URLSafeBase64Decode(payload), serializer);
		}
	};

export const BaseURLSafeSerializer = URLSafeSerializerMixin(BaseSerializer);

/**
 *
 * @param {string} secretKey
 * @param {object} options
 * @param {string} [options.salt='itsdanger.Serializer']
 * @param {function} [options.serializer=Json]
 * @param {function} [option.signer=Signer]
 * @param {object} [options.signerArgs]
 * @param {string} [options.signerArgs.sep]
 * @param {string} [options.signerArgs.keyDerivation]
 * @param {string} [options.signerArgs.digestMethod]
 * @param {function} [options.signerArgs.algorithm]
 */
export const URLSafeSerializer = function (secretKey: string, options: SerializerOptions = {}) {
	return new BaseURLSafeSerializer(secretKey, options);
};

export const BaseURLSafeTimedSerializer =
	URLSafeSerializerMixin(BaseTimedSerializer);

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
export const URLSafeTimedSerializer = function (secretKey: string, options: TimestampSignerOptions = {}) {
	return new BaseURLSafeTimedSerializer(secretKey, options);
};
