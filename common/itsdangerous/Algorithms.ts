/**
 * Algorithms for signing and comparing values with signatures
 *
 * @todo this needs a factory function
 *
 * @module algorithms
 */

import {
    createHash,
    createHmac,
    getHashes,
    timingSafeEqual
} from "node:crypto";

const HASHES = getHashes();

export const KeyDerivations = {
	CONCAT: "concat",
	DJANGO: "django-concat",
	HMAC: "hmac",
	NONE: "none",
};

const createKeyDerivation = (
	keyDerivation: typeof KeyDerivations.CONCAT | typeof KeyDerivations.DJANGO,
	key: string,
	value: string
): string => {
	return {
		[KeyDerivations.CONCAT]: (key: string, value: string) =>
			`${value}${key}`,
		[KeyDerivations.DJANGO]: (key: string, value: string) =>
			`${value}signer${key}`,
	}[keyDerivation](key, value);
};

/**
 * Subclasses must implement `getSignature` to provide signature generation functionality.
 */
export abstract class SigningAlgorithm {
	/**
	 * Returns the signature for the given key and value.
	 */
	getSignature(key: string, value: string): string {
		throw new Error("Not Implemented");
	}

	/**
	 * Verifies the given signature matches the expected signature.
	 * @param {string} key
	 * @param {string} value
	 * @param {string} signature
	 * @return {boolean}
	 */
	verifySignature(key: string, value: string, signature: string): boolean {
		return timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(this.getSignature(key, value))
		);
	}
}

/**
 * Provides an algorithm using the `crypto.Hash` hashing method for any supported digest.
 * @extends {module:algorithms~SigningAlgorithm}
 */
class HashSigningAlgorithm extends SigningAlgorithm {
	keyDerivation: string;
	digestMethod: string;

	/**
	 *
	 * @param {string} [digestMethod="sha1"]
	 * @param {string} [keyDerivation="django-concat"]
	 */
	constructor(
		digestMethod: string = "sha1",
		keyDerivation: string = "django-concat"
	) {
		super();
		this.keyDerivation = keyDerivation;
		this.digestMethod =
			(HASHES.includes(digestMethod) && digestMethod) || "sha1";
	}

	getSignature(key: string, value: string): string {
		const keyValue = createKeyDerivation(this.keyDerivation, key, value);
		return createHash(this.digestMethod).update(keyValue).digest("binary");
	}
}

/**
 * Factory function for returning instances an Hash algorithm
 * @param {string} digestMethod
 * @param {string} keyDerivation
 * @return {module:algorithms~HashSigningAlgorithm}
 */
const HashAlgorithm = (digestMethod: string, keyDerivation: string) =>
	new HashSigningAlgorithm(digestMethod, keyDerivation);

/**
 * Provides an algorithm using the {@link crypto.Hmac} hashing algorithm for any supported digest
 * @extends {module:algorithms~SigningAlgorithm}
 */
class HmacSigningAlgorithm extends SigningAlgorithm {
	digestMethod: string;

	/**
	 * @param {string} [digestMethod="sha1"]
	 */
	constructor(digestMethod: string = "sha1") {
		if (!HASHES.includes(digestMethod))
			throw new Error(`Unsupported digest method: ${digestMethod}`);

		super();
		this.digestMethod = digestMethod;
	}

	getSignature(key: string, value: string): string {
		return createHmac(this.digestMethod, key)
			.update(value)
			.digest("binary");
	}
}

/**
 * Factory function for returning instances an Hmac algorithm
 * @param {string} digestMethod
 * @return {module:algorithms~HmacSigningAlgorithm}
 */
const HmacAlgorithm = (digestMethod: string) =>
	new HmacSigningAlgorithm(digestMethod);

/**
 * Provides an algorithm that does not perform any signing and returns an empty signature.
 * @extends {module:algorithms~SigningAlgorithm}
 */
class NoneSigningAlgorithm extends SigningAlgorithm {
	getSignature(key: string, value: string): string {
		return "";
	}
}

/**
 * Factory function for returning instances of a no-op algorithm
 * @return {module:algorithms~NoneSigningAlgorithm}
 */
const NoneAlgorithm = () => new NoneSigningAlgorithm();

export {
    HashSigningAlgorithm,
    HmacSigningAlgorithm,
    NoneSigningAlgorithm,
    HashAlgorithm,
    HmacAlgorithm,
    NoneAlgorithm,
};

