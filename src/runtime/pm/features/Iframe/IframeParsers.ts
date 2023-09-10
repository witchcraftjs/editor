// todo async oembed paste, much pain

export const defaultAllow = ["fullscreen", "accelerometer", "autoplay", "clipboard-write", "encrypted-media", "gyroscope", "picture-in-picture", "web-share"].join(";")

export function addDefaultQueryParams(parsedUrl: URL, defaultQueryParams: Record<string, any>): string {
	for (const [key, value] of Object.entries(defaultQueryParams)) {
		if (!parsedUrl.searchParams.has(key)) {
			parsedUrl.searchParams.set(key, value)
		}
	}
	return parsedUrl.toString()
}
export function getAspectRatio(element: HTMLElement, defaultRatio = 16 / 9): number | undefined {
	const width = element.getAttribute("width")
	const height = element.getAttribute("height")
	const w = width ? Number.parseInt(width, 10) : null
	const h = height ? Number.parseInt(height, 10) : null
	if (typeof w === "number" && typeof h === "number") {
		return w / h
	}
	return defaultRatio
}
type DefaultAttributes = Record<string, any> & {
	aspectRatio: number
}

export interface IframeSourceParser {
	defaultAttributes: DefaultAttributes
	defaultQueryParams: Record<string, any>
	// should also sanitize
	parseAttributes: (element: HTMLElement) => Record<string, any> | false
	cleanUrl: (url: string) => string
	matchUrl?: RegExp
}

export class DefaultSourceParser implements IframeSourceParser {
	cache: Map<string, any> = new Map()

	defaultAttributes: DefaultAttributes = {
		aspectRatio: 16 / 9
	}

	defaultQueryParams: Record<string, any> = {}

	parseAttributes(element: HTMLElement): Record<string, any> | false {
		const src = element.getAttribute("src")
		const allow = element.getAttribute("allow")
		const aspectRatio = getAspectRatio(element, this.defaultAttributes.aspectRatio)
		if (!src) return false
		return {
			src,
			allow,
			aspectRatio
		}
	}

	cleanUrl(url: string): string {
		const parsedUrl = new URL(url)
		addDefaultQueryParams(parsedUrl, this.defaultQueryParams)
		return parsedUrl.toString()
	}
}
export class YoutubeSourceParser extends DefaultSourceParser implements IframeSourceParser {
	override defaultAttributes: DefaultAttributes = {
		allow: defaultAllow,
		referrerpolicy: "strict-origin-when-cross-origin",
		allowfullscreen: "true",
		aspectRatio: 16 / 9
	}

	override defaultQueryParams: Record<string, any> = {
		controls: 1
	}

	matchUrl: RegExp = /^((?:https?:\/\/)?(?:www.)?(?:youtube.com|youtu.be.com)[^ ]*)$/g
}
export class InstagramSourceParser extends DefaultSourceParser implements IframeSourceParser {
	override defaultAttributes: DefaultAttributes = {
		aspectRatio: 9 / 12
	}

	override defaultQueryParams: Record<string, any> = {}

	override cleanUrl(url: string): string {
		const parsedUrl = new URL(url)
		addDefaultQueryParams(parsedUrl, this.defaultQueryParams)
		if (parsedUrl.pathname.includes("/embed")) {
			return parsedUrl.toString()
		} else {
			parsedUrl.pathname += parsedUrl.pathname.endsWith("/") ? "embed" : "/embed"
			return parsedUrl.toString()
		}
	}

	matchUrl: RegExp = /^((?:https?:\/\/)?(?:www.)?instagram.com\/p[^ ]*)$/g
}

export class VimeoSourceParser extends DefaultSourceParser implements IframeSourceParser {
	override defaultAttributes: DefaultAttributes = {
		aspectRatio: 16 / 9,
		allow: ["autoplay", "fullscreen", "picture-in-picture"].join(";")
	}

	matchUrl: RegExp = /^((?:https?:\/\/)?(?:www.)?(?:player.)?vimeo.com\/[^ ]*)$/g

	override cleanUrl(url: string): string {
		const parsedUrl = new URL(url)
		addDefaultQueryParams(parsedUrl, this.defaultQueryParams)
		if (parsedUrl.pathname.includes("/video") && parsedUrl.hostname.includes("player.vimeo.com")) {
			return parsedUrl.toString()
		} else {
			parsedUrl.pathname = `/video${parsedUrl.pathname}`
			return new URL(parsedUrl.pathname, "https://player.vimeo.com/video").toString()
		}
	}
}
