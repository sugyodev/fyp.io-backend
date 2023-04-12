import EmbedObject from "./EmbedObject";

export abstract class BaseResolver {
    /**
     * The internal name of this resolver
     */
	abstract get name(): string;

	/**
	 * Checks if the provided URL is supported by this resolver
	 * @param url The URL to check
	 * @returns True if the URL looks valid and is supported by this resolver.
	 */
	abstract checkUrl(url: string): boolean;

	/**
	 * Resolves the provided URL to an EmbedObject
	 * @param url The URL to resolve
	 * @returns An EmbedObject
	 */
	abstract resolve(url: string): Promise<EmbedObject>;
}
