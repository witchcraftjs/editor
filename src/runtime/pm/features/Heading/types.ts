export interface HeadingNodeOptions<T extends number[] = [1, 2, 3, 4, 5, 6]> {
	/**
	 * The available heading levels.
	 */
	levels: T

	/**
	 * The HTML attributes for the heading node.
	 *
	 * Each value can also be an array of values for each heading level.
	 *
	 * The default adds tailwind text size classes.
	 */

	// eslint-disable-next-line @typescript-eslint/naming-convention
	HTMLAttributes: Record<string, any>
}
