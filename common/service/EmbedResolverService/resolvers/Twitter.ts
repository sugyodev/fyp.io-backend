import { BaseResolver } from "../BaseResolver";
import EmbedObject from "../EmbedObject";

export class TwitterResolver extends BaseResolver {
	static PATH_REGEX = /^\/@?(\w{1,15})\/?/;

	get name(): string {
		return "twitter";
	}

	checkUrl(url: string): boolean {
		const urlObj = new URL(url);

		if (urlObj.hostname !== "twitter.com") {
			return false;
		}

		// check if it's a profile
		if (TwitterResolver.PATH_REGEX.test(urlObj.pathname)) {
			return true;
		}

		return false;
	}

	resolve(url: string): Promise<EmbedObject> {
		throw new Error("Method not implemented.");
	}
}

export default TwitterResolver;
