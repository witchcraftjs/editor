export function attrsToClasses(attrs: Record<string, boolean>, keys: string[] = Object.keys(attrs)): string {
	const classes = []
	for (const key of keys) {
		if (attrs[key]) {classes.push(key)} else {classes.push(`not-${key}`)}
	}
	return classes.join(" ")
}
