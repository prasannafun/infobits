const path = require("path")
const fs = require("fs")

const ffmpegService = require("../services/ffmpeg.service")
const youtubeService = require("../services/youtube.service")
const { wrapText } = require("../services/text.service")
const { buildYouTubeMetadata } = require("../services/metadata.service")
const { safeDelete } = require("../utils/file.util")

exports.renderVideo = async (req, res) => {
	let outputFile

	try {
		let { videoUrl, quote, out } = req.body

		if (!videoUrl || !quote) {
			return res.status(400).send("videoUrl and quote required")
		}

		const cleanedQuote = String(quote).trim()
		if (!cleanedQuote.length) {
			throw new Error("Quote is empty")
		}

		out = String(out || Date.now()).replace(/[:.]/g, "_")

		const outputDir = path.join(__dirname, "../output")
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

		outputFile = path.join(outputDir, `${out}.mp4`)

		// 1️⃣ Wrap text
		const lines = wrapText(cleanedQuote, 22)
		if (!lines.length) {
			throw new Error("Text wrapping failed")
		}

		// 2️⃣ Render video (BG MUSIC ONLY)
		await ffmpegService.renderVideo({
			videoUrl,
			lines,
			outputFile,
			duration: 15, // Shorts length
		})

		// 3️⃣ Upload to YouTube
		const metadata = buildYouTubeMetadata(cleanedQuote)

		const youtubeUrl = await youtubeService.upload({
			filePath: outputFile,
			title: metadata.title,
			description: metadata.description,
			tags: metadata.tags,
		})

		res.json({
			success: true,
			url: youtubeUrl,
		})
	} catch (err) {
		console.error("RENDER ERROR:", err)
		res.status(500).send(String(err))
	} finally {
		safeDelete(outputFile)
	}
}
