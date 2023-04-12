/**
 * Normalized interface to JSON builtins.
 *
 */

/**
 * An interface for serializing
 * @typedef {object} SerializerLike
 * @property {value: any => string} dumps
 * @property {text: string => any} loads
 */
export interface SerializerLike {
	dumps(value: any): string;
	loads(text: string): any;
}

/** @type {typeof SerializerLike} */
const Json = {
	dumps: (value: any) => JSON.stringify(value, null, 0),
	loads: (text: string) => JSON.parse(text),
};

export default Json;
