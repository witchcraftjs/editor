export function to_list(list: any): any {
	let res = list.map((item: any) => {
		if (typeof item === "string") {
			return { name: item }
		} else {
			let name = item[0]
			let children = to_list(item.slice(1, item.length))
			return { name, children }
		}
	})
	return res
}
