exports.wrapText = (text, maxChars = 20) => {
	const words = text.split(" ")
	const lines = []
	let line = ""

	for (const w of words) {
		if ((line + " " + w).trim().length <= maxChars) {
			line = (line + " " + w).trim()
		} else {
			lines.push(line)
			line = w
		}
	}
	if (line) lines.push(line)

	return lines
}
