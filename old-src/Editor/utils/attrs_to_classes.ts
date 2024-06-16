export function attrs_to_classes(attrs: Record<string, boolean>, keys: string[] = Object.keys(attrs)): string {
	let classes = []
	for (let key of keys) {
		if (attrs[key]) {classes.push(key)} else {classes.push(`not-${key}`)}
	}
	return classes.join(" ")
}
