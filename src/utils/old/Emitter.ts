export class Emitter {
	events: Record<string, ((...args: any[]) => void)[]> = {}

	on(type: string, listener: (...args: any[]) => void): void {
		this.events[type] ||= []
		this.events[type].push(listener)
	}

	off(type: string, listener: (...args: any[]) => void): void {
		this.events[type] ||= []
		const index = this.events[type].indexOf(listener)
		if (index === -1) throw new Error("could not find listener")
		this.events[type].splice(index, 1)
	}

	emit(type: string): void {
		this.events[type] ||= []
		for (const listener of this.events[type]) listener(type)
	}
}
