exports.buildYouTubeMetadata = (quote) => {
	const cleanQuote = quote.trim()

	const description = `
🔥 One quote can change your mindset.

"${cleanQuote}"

This short is a reminder that discipline, consistency, and belief are the real keys to success.
Save this video and come back whenever motivation fades 💪

👉 Follow for daily motivation
👉 Like • Share • Subscribe

#shorts #motivation #success #mindset #quotes
`.trim()

	const tags = [
		"motivation",
		"motivational shorts",
		"shorts",
		"ytshorts",
		"success",
		"mindset",
		"discipline",
		"life quotes",
		"inspirational quotes",
		"daily motivation",
		"self improvement",
		"positive mindset",
		"hard work",
		"personal growth",
		"stay motivated",
		"quotes shorts",
		"viral shorts",
		"success mindset",
	]

	return {
		title: cleanQuote.slice(0, 90),
		description,
		tags,
	}
}
