const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const MUSIC_DIR = path.join(__dirname, "../music")

function getRandomMusicFile() {
	const files = fs.readdirSync(MUSIC_DIR).filter(f =>
		f.endsWith(".mp3") || f.endsWith(".wav")
	)
	if (!files.length) throw new Error("No music files found")
	return path.join(MUSIC_DIR, files[Math.floor(Math.random() * files.length)])
}

/**
 * FREE OFFLINE TTS using espeak-ng
 */
function generateVoiceRaw(text, voiceFile) {
	return new Promise((resolve, reject) => {
		const safeText = text.replace(/"/g, "")
		const cmd = `
			espeak-ng "${safeText}" --stdout | \
			ffmpeg -y -f wav -i pipe:0 -ar 44100 -ac 2 "${voiceFile}"
		`
		exec(cmd, err => (err ? reject(err) : resolve()))
	})
}

/**
 * Mix voice + background music
 */
function mixWithMusic(voiceFile, outputFile) {
	return new Promise((resolve, reject) => {
		const musicFile = getRandomMusicFile()
		const cmd = `
			ffmpeg -y \
			-i "${voiceFile}" \
			-stream_loop -1 -i "${musicFile}" \
			-filter_complex "
				[1:a]volume=0.12,atrim=start=25[m];
				[0:a][m]amix=inputs=2:dropout_transition=2,
				afade=t=in:st=0:d=0.5,
				afade=t=out:st=14.5:d=0.5
			" \
			-t 15 "${outputFile}"
		`
		exec(cmd, err => (err ? reject(err) : resolve()))
	})
}

exports.generateVoice = async (text, outputFile) => {
	if (!text || typeof text !== "string") {
		throw new Error("Invalid text")
	}

	await fs.promises.mkdir(path.dirname(outputFile), { recursive: true })

	const tempVoice = path.join(
		path.dirname(outputFile),
		`voice_${Date.now()}.wav`
	)

	try {
		await generateVoiceRaw(text, tempVoice)
		await mixWithMusic(tempVoice, outputFile)
		console.log("🎙 Voice + music generated (FREE)")
	} finally {
		if (fs.existsSync(tempVoice)) fs.unlinkSync(tempVoice)
	}
}
