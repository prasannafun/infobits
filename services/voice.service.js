const fs = require("fs")
const axios = require("axios")
// const { spawn } = require("child_process")

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

if (!ELEVENLABS_API_KEY) {
	throw new Error("❌ ELEVENLABS_API_KEY is missing")
}

console.log("ELEVENLABS_API_KEY present:", !!process.env.ELEVENLABS_API_KEY)
console.log("ELEVENLABS_API_KEY:", process.env.ELEVENLABS_API_KEY)

// ✅ REPLACE with your OWN voice ID
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID

if (!VOICE_ID) {
	throw new Error("❌ ELEVENLABS_VOICE_ID is missing")
}

async function elevenLabsVoice(text, outputFile) {
	const response = await axios.post(
		`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
		{
			text,
			model_id: "eleven_multilingual_v2",
		},
		{
			headers: {
				"xi-api-key": ELEVENLABS_API_KEY,
				"Content-Type": "application/json",
				Accept: "audio/mpeg",
			},
			responseType: "stream",
			timeout: 30000, // 👈 REQUIRED on Render
		}
	)

	await new Promise((resolve, reject) => {
		const stream = fs.createWriteStream(outputFile)
		response.data.pipe(stream)
		stream.on("finish", resolve)
		stream.on("error", reject)
	})
}

exports.generateVoice = async (text, outputFile) => {
	try {
		await elevenLabsVoice(text, outputFile)
		console.log("🎙 ElevenLabs voice used")
	} catch (err) {
		console.error("ElevenLabs error:", {
			status: err.response?.status,
			data: err.response?.data,
			message: err.message,
		})
		throw new Error("Voice generation failed (ElevenLabs)")

		throw err
	}
}
