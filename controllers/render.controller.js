const path = require("path")
const fs = require("fs")

const ffmpegService = require("../services/ffmpeg.service")
const voiceService = require("../services/voice.service")
const youtubeService = require("../services/youtube.service")
const { wrapText } = require("../services/text.service")
const { safeDelete } = require("../utils/file.util")
const { buildYouTubeMetadata } = require("../services/metadata.service")


exports.renderVideo = async (req, res) => {
	let outputFile
	let voiceFile

	try {
		let { videoUrl, quote, out } = req.body

		out = String(out || Date.now()).replace(/[:.]/g, "_")
		quote = quote.replace(/[']/g, "")

		const outputDir = path.join(__dirname, "../output")
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

		outputFile = path.join(outputDir, `${out}.mp4`)
		voiceFile = path.join(outputDir, `${out}.mp3`)

		await voiceService.generateVoice(quote, voiceFile)

		const lines = wrapText(quote, 22)

		await ffmpegService.renderVideo({
			videoUrl,
			voiceFile,
			lines,
			outputFile,
		})

        const metadata = buildYouTubeMetadata(quote)

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
		res.status(500).send("Render failed")
	} finally {
		// 🔥 CLEANUP (always runs)
		safeDelete(outputFile)
		safeDelete(voiceFile)
	}
}

