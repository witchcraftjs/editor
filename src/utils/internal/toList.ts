export function toList(list: any): any {
	const res = list.map((item: any) => {
		if (typeof item === "string") {
			return { name: item }
		} else {
			const name = item[0]
			const children = toList(item.slice(1, item.length))
			return { name, children }
		}
	})
	return res
}
