export async function readAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader()
		fileReader.readAsDataURL(file)
		fileReader.onload = () => {
			resolve(fileReader.result as string)
		}
		fileReader.onerror = e => {
			reject(e)
		}
	})
}
