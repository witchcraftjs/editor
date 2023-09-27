import type { DevListItem, DevStringList } from "src/types.js"


export function toList(list: DevStringList): DevListItem[] {
	const res = list.map(entry => {
		let type = "none"
		if (typeof entry === "string") {
			return { name: entry, type }
		} else {
			const item = entry[0]
			let name = item
			console.log(name, item)
			if (Array.isArray(name)) {
				name = item[1]
				type = item[0]
			}
			const children = toList(entry.slice(1, entry.length) as DevStringList)
			return { name, children, type }
		}
	})
	return res as DevListItem[]
}
