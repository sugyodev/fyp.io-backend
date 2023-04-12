/**
 * Splits a string by `delimiter` from the right
 *
 * This is a "dumb" implementation in that we split only once. I have my reasons.
 * @param {string} str
 * @param {string} delim
 * @return {Array<string>}
 */
export const rsplit = (
	str: string,
	delim: string
): [string, string | undefined] => {
	const arr = str.split(delim);
	const last = arr.pop();
	return [arr.join(delim), last];
};

export const required = (name: string) => {
	throw new Error(`Argument '${name}' is required.'`);
};

export const identity = (...keys: any[]) =>
	keys.reduce((map, key) => ({ ...map, [key]: key }), {});
