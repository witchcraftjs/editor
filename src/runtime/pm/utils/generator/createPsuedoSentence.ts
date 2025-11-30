import { faker } from "@faker-js/faker"

export function createPsuedoSentence({ min = 0, max = 10}: { min?: number, max?: number } = {}) {
	// sentence generated with string.sample (which contains all possible chars) instead of lorem.sentence
	const sentenceLength = faker.number.int({ min, max })
	const sentence = Array.from(
		{ length: sentenceLength },
		() => {
			const doLorem = faker.number.float() < 0.5
			if (doLorem) {
				return faker.lorem.word()
			} else {
				return faker.string.sample({ min: 1, max: 10 })
			}
		}
	).join(" ")
	return sentence
}
