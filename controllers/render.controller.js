const path = require("path")
const fs = require("fs")

const ffmpegService = require("../services/ffmpeg.service")
const voiceService = require("../services/voice.service")
const youtubeService = require("../services/youtube.service")
const { wrapText } = require("../services/text.service")
const { buildYouTubeMetadata } = require("../services/metadata.service")
const { getAudioDuration } = require("../services/audio.service")
const { safeDelete } = require("../utils/file.util")

exports.renderVideo = async (req, res) => {
	let outputFile
	let voiceFile

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
		voiceFile = path.join(outputDir, `${out}.mp3`)

		// 1️⃣ Generate voice
		await voiceService.generateVoice(cleanedQuote, voiceFile)

		// 2️⃣ Measure audio duration
		const audioDuration = await getAudioDuration(voiceFile)
		console.log("🎧 Audio duration:", audioDuration)

		// 3️⃣ Wrap text
		const lines = wrapText(cleanedQuote, 22)
		if (!lines.length) {
			throw new Error("Text wrapping failed")
		}

		// 4️⃣ Render video
		await ffmpegService.renderVideo({
			videoUrl,
			voiceFile,
			lines,
			audioDuration,
			outputFile,
		})

		// 5️⃣ Upload to YouTube
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
		// 🧹 Always cleanup
		safeDelete(outputFile)
		safeDelete(voiceFile)
	}
}
