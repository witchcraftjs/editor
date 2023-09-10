export const idRegex = /^[\w-]+$/
export function isValidId(id: string | undefined | null, length?: number): boolean {
	// technically it's not possible to have an undefined id anymore, but leaving just in case
	if (id === undefined || id === null || (length !== undefined && id.length !== length) || !idRegex.test(id)) {
		return false
	}
	return true
}
