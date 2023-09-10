export function getEmbedJson(
	nodeWanted: Record<string, any> | undefined
): Record<string, any> | undefined {
	if (nodeWanted) {
		return {
			type: "doc",
			content: [
				{
					type: "list",
					content: [nodeWanted as any]
				}
			]
		}
	}
	return undefined
}
