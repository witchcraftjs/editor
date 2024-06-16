export type StatefulNodeStateEntry<T extends string = string> = {
	icon: string
	value: T
	/** Whether ariaChecked should be true */
	// todo rename
	isChecked: boolean
	isEnabled: boolean
}
export type StatefulNodeType<
	T extends StatefulNodeStateEntry[] = StatefulNodeStateEntry[],
TDefault extends T[number]["value"] = T[number]["value"],
> = {
	entries: T
	default: TDefault
}

function createStatefulNodeType<T extends StatefulNodeStateEntry[]>(entries: T, defaultValue: T[number]["value"]): StatefulNodeType<T> {
	return { entries, default: defaultValue }
}
import cancelledSvg from "./states/task/cancelled.svg?url"
import checkedSvg from "./states/task/checked2.svg?url"
import partialSvg from "./states/task/partial2.svg?url"
import uncheckedSvg from "./states/task/unchecked.svg?url"


export type StatefulNodeStates = Record<string, StatefulNodeType>
export const statefulStates: StatefulNodeStates = {
	task: createStatefulNodeType(
		[
			{
				icon: `url(${uncheckedSvg})`,
				value: "unchecked" as const,
			},
			{
				icon: `url(${partialSvg})`,
				value: "partial" as const,
			},
			{
				icon: `url(${checkedSvg})`,
				// icon: "☑",
				value: "checked" as const,
				isChecked: true,
			},
			{
				icon: `url(${cancelledSvg})`,
				value: "cancelled" as const,
				isChecked: true,
			},
		].map(_ => ({
			isEnabled: true,
			isChecked: _.isChecked ?? false,
			..._,
		})),
		"unchecked"
	),
}

