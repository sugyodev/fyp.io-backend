export default interface EmbedObject {
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
