import { keys } from "@alanscodelog/utils/keys"
import type { Transaction } from "@tiptap/pm/state"

export function copyMeta(from: Transaction, to: Transaction): void {
	for (const key of keys<string>((from as any).meta)) {
		to.setMeta(key, from.getMeta(key))
	}
}
