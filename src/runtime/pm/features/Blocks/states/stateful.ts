import cancelledSvg from "./task/cancelled.svg?url"
import checkedSvg from "./task/checked2.svg?url"
import partialSvg from "./task/partial2.svg?url"
import uncheckedSvg from "./task/unchecked.svg?url"

import type { StatefulNodeStateEntry, StatefulNodeStates, StatefulNodeType } from "../types.js"

function createStatefulNodeType<T extends StatefulNodeStateEntry[]>(entries: T, defaultValue: T[number]["value"]): StatefulNodeType<T> {
	return { entries, default: defaultValue }
}

export const statefulStates: StatefulNodeStates = {
	task: createStatefulNodeType(
		[
			{
				icon: `url(${uncheckedSvg})`,
				value: "unchecked" as const
			},
			{
				icon: `url(${partialSvg})`,
				value: "partial" as const
			},
			{
				icon: `url(${checkedSvg})`,
				// icon: "☑",
				value: "checked" as const,
				isChecked: true
			},
			{
				icon: `url(${cancelledSvg})`,
				value: "cancelled" as const,
				isChecked: true
			}
		].map(_ => ({
			isEnabled: true,
			isChecked: _.isChecked ?? false,
			..._
		})),
		"unchecked"
	)
}
