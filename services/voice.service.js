const fs = require("fs")
const path = require("path")
const axios = require("axios")

/**
 * ENV VALIDATION
 */
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID

if (!ELEVENLABS_API_KEY) {
	throw new Error("❌ ELEVENLABS_API_KEY is missing")
}

if (!ELEVENLABS_VOICE_ID) {
	throw new Error("❌ ELEVENLABS_VOICE_ID is missing")
}

console.log("✅ ElevenLabs API key present")
console.log("✅ ElevenLabs Voice ID present")

/**
 * OPTIONAL: AUTH CHECK (RUNS ONCE)
 * Helps you immediately know if key / plan / scope is valid
 */
async function validateElevenLabsAuth() {
	try {
		await axios.get("https://api.elevenlabs.io/v1/voices", {
			headers: {
				"xi-api-key": ELEVENLABS_API_KEY,
				"User-Agent": "infobits-render/1.0",
			},
			timeout: 10000,
		})
		console.log("✅ ElevenLabs auth validated")
	} catch (err) {
		console.error("❌ ElevenLabs auth failed:", {
			status: err.response?.status,
			message: err.message,
		})
		throw new Error("ElevenLabs authentication failed")
	}
}

/**
 * CORE TTS FUNCTION (BASE64 – SAFE FOR N8N)
 */
async function elevenLabsVoice(text, outputFile) {
	if (!text || typeof text !== "string" || text.trim().length === 0) {
		throw new Error("❌ Invalid text for TTS")
	}

	const response = await axios.post(
		`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
		{
			text,
			model_id: "eleven_multilingual_v2",
			output_format: "mp3_44100_128",
		},
		{
			headers: {
				"xi-api-key": ELEVENLABS_API_KEY,
				"Content-Type": "application/json",
				"User-Agent": "infobits-render/1.0",
			},
			timeout: 30000,
		}
	)

	const audioBuffer = Buffer.from(response.data, "base64")

	await fs.promises.mkdir(path.dirname(outputFile), { recursive: true })
	await fs.promises.writeFile(outputFile, audioBuffer)
}

/**
 * EXPORTED FUNCTION (USED BY CONTROLLER / N8N)
 */
exports.generateVoice = async (text, outputFile) => {
	try {
		await validateElevenLabsAuth()
		await elevenLabsVoice(text, outputFile)
		console.log("🎙 ElevenLabs voice generated successfully")
	} catch (err) {
		console.error("❌ ElevenLabs error:", {
			status: err.response?.status,
			data: err.response?.data,
			message: err.message,
		})
		throw new Error("Voice generation failed (ElevenLabs)")
	}
}
