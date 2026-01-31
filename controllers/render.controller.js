const path = require("path")
const fs = require("fs")

const ffmpegService = require("../services/ffmpeg.service")
const voiceService = require("../services/voice.service")
const youtubeService = require("../services/youtube.service")
const { wrapText } = require("../services/text.service")

exports.renderVideo = async (req, res) => {
	try {
		let { videoUrl, quote, out } = req.body

		if (!videoUrl || !quote) {
			return res.status(400).send("videoUrl and quote required")
		}

		out = String(out || Date.now()).replace(/[:.]/g, "_")
		quote = quote.replace(/[']/g, "")

		const outputDir = path.join(__dirname, "../output")

		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

		const outputFile = path.join(outputDir, `${out}.mp4`)
		const voiceFile = path.join(outputDir, `${out}.wav`)

		// services
		await voiceService.generateVoice(quote, voiceFile)

		const lines = wrapText(quote, 22)

		await ffmpegService.renderVideo({
			videoUrl,
			voiceFile,
			lines,
			outputFile,
		})

		const youtubeUrl = await youtubeService.upload({
			filePath: outputFile,
			title: quote.slice(0, 90),
		})

		// cleanup
		fs.unlinkSync(outputFile)
		fs.unlinkSync(voiceFile)

		res.json({
			success: true,
			url: youtubeUrl,
		})
	} catch (err) {
		console.error(err)
		res.status(500).send("Render failed")
	}
}
