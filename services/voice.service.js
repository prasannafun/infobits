const fs = require("fs")
const axios = require("axios")
const { spawn } = require("child_process")

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"

async function elevenLabsVoice(text, outputFile) {
	const response = await axios({
		method: "POST",
		url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
		headers: {
			"xi-api-key": ELEVENLABS_API_KEY,
			"Content-Type": "application/json",
			Accept: "audio/mpeg",
		},
		responseType: "stream",
		data: {
			text,
			model_id: "eleven_multilingual_v2",
		},
	})

	await new Promise((resolve, reject) => {
		const stream = fs.createWriteStream(outputFile)
		response.data.pipe(stream)
		stream.on("finish", resolve)
		stream.on("error", reject)
	})
}

function macVoice(text, outputFile) {
	return new Promise((resolve, reject) => {
		const say = spawn("say", [
			"-v",
			"Samantha",
			"-o",
			outputFile,
			"--data-format=LEI16@44100",
			text,
		])
		say.on("close", resolve)
		say.on("error", reject)
	})
}

exports.generateVoice = async (text, outputFile) => {
	try {
		await elevenLabsVoice(text, outputFile)
		console.log("🎙 ElevenLabs voice used")
	} catch (err) {
		if (err.response?.status === 402) {
			console.warn("⚠️ ElevenLabs quota exceeded — using fallback voice")
			await macVoice(text, outputFile)
		} else {
			throw err
		}
	}
}
