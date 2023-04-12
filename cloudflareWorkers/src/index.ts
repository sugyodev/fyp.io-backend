function json(payload: any, status: number = 200) {
	return new Response(JSON.stringify(payload), {
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
		status,
	});
}

interface Resolver {
	resolve(request: Request, url: URL): Promise<Response>;
}

// In sync with common/service/EmbedResolverService/EmbedObject.ts
interface EmbedObject {
	/**
	 * The service of the embed, such as "twitter" or "youtube". Must match the name specified in the resolver implementation.
	 */
	service: string;

	/**
	 * The title of the embed.
	 */
	title: string;

	/**
	 * The description of the embed.
	 */
	description?: string;

	/**
	 * The icon of the embed, such as the profile picture of an user.
	 */
	icon?: string;

	/**
	 * The image of the embed, such as the banner of a profile.
	 */
	banner?: string;

	/**
	 * The canonical URL of the embed.
	 * This is the URL that should be used when the user clicks on the embed
	 * to visit the original page.
	 */
	canonicalUrl: string;
}

class TwitterResolver implements Resolver {
	static PUB_TOKEN =
		"Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

	async resolve(request: Request, url: URL) {
		const username = url.searchParams.get("username");
		if (!username) {
			return json({ message: "Missing username" }, 400);
		}

		const guestToken = await this.getGuestToken();
		if (!guestToken) {
			return json({ message: "Failed to get guest token" }, 500);
		}

		const features = {
			responsive_web_twitter_blue_verified_badge_is_enabled: true,
			responsive_web_graphql_exclude_directive_enabled: true,
			verified_phone_label_enabled: false,
			responsive_web_graphql_skip_user_profile_image_extensions_enabled:
				false,
			responsive_web_graphql_timeline_navigation_enabled: true,
		};

		const variables = {
			screen_name: username,
			withSafetyModeUserFields: true,
			withSuperFollowsUserFields: true,
		};

		const encodedVariables = encodeURIComponent(JSON.stringify(variables));
		const encodedFeatures = encodeURIComponent(JSON.stringify(features));

		const graphQLUrl = `https://api.twitter.com/graphql/rePnxwe9LZ51nQ7Sn_xN_A/UserByScreenName?variables=${encodedVariables}&features=${encodedFeatures}`;

		const resp = await fetch(graphQLUrl, {
			headers: {
				authorization: TwitterResolver.PUB_TOKEN,
				"x-guest-token": guestToken,
			},
		});

		if (!resp.ok) {
			return json({ message: "Failed to get user data" }, 500);
		}

		const twitterData = await resp.json();
		console.log(JSON.stringify(twitterData, null, 2));

		let icon = twitterData.data.user.result.legacy.profile_image_url_https;
		if (icon) {
			icon = icon.replace("_normal", "");
		}

		const embed: EmbedObject = {
			title: twitterData.data.user.result.legacy.name,
			description: twitterData.data.user.result.legacy.description,
			icon,
			banner: twitterData.data.user.result.legacy.profile_banner_url,
			canonicalUrl: `https://twitter.com/${username}`,
			service: "twitter",
		};

		return json(embed);
	}

	async getGuestToken() {
		const activateUrl = "https://api.twitter.com/1.1/guest/activate.json";

		const res = await fetch(activateUrl, {
			method: "POST",
			headers: {
				authorization: TwitterResolver.PUB_TOKEN,
			},
		});

		const json = await res.json();
		console.log(json);

		return json.guest_token;
	}
}

const resolvers: { [name: string]: Resolver } = {
	twitter: new TwitterResolver(),
};

function handleFetch(request) {
	const url = new URL(request.url);
	console.log(url.pathname);
	console.log(url.searchParams);

	for (const [name, resolver] of Object.entries(resolvers)) {
		if (url.pathname === `/${name}`) {
			try {
				return resolver.resolve(request, url);
			} catch (e) {
				console.log(e);
				return json({ message: "Internal error" }, 500);
			}
		}
	}

	return json({ message: "Not found" }, 404);
}

export default {
	fetch: handleFetch,
};
