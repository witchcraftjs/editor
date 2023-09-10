import type { DevListItem, DevStringList } from "src/types.js"


export function toList(list: DevStringList): DevListItem[] {
	const res = list.map(item => {
		if (typeof item === "string") {
			return { name: item }
		} else {
			const name = item[0] as string
			const children = toList(item.slice(1, item.length) as DevStringList)
			return { name, children }
		}
	})
	return res
}
