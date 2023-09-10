import type { MarkMenu, Menu } from "../types.js"

export function isMarkMenu(menu: Menu): menu is MarkMenu {
	return menu.type === "mark"
}
