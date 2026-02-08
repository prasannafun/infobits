const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const MUSIC_DIR = path.join(__dirname, "../music")

/**
 * Pick a random music file from /music
 */
function getRandomMusicFile() {
	const files = fs
		.readdirSync(MUSIC_DIR)
		.filter(f => f.endsWith(".mp3") || f.endsWith(".wav"))

	if (!files.length) {
		throw new Error("❌ No music files found in /music")
	}

	return path.join(
		MUSIC_DIR,
		files[Math.floor(Math.random() * files.length)]
	)
}

/**
 * Generate ONLY background music
 * - Random middle cut
 * - Fade in / fade out
 * - No voice
 * - No TTS
 */
function generateBackgroundMusicInternal(outputFile, duration = 15) {
	return new Promise((resolve, reject) => {
		const musicFile = getRandomMusicFile()

		// Random start so audio is unique every time
		const startOffset = Math.floor(Math.random() * 40)

		const cmd = `
			ffmpeg -y \
			-i "${musicFile}" \
			-af "
				volume=0.15,
				atrim=start=${startOffset}:duration=${duration},
				afade=t=in:st=0:d=0.5,
				afade=t=out:st=${duration - 0.5}:d=0.5
			" \
			"${outputFile}"
		`

		exec(cmd, err => (err ? reject(err) : resolve()))
	})
}

/**
 * EXPORTED FUNCTION
 */
exports.generateBackgroundMusic = async (outputFile, duration = 15) => {
	await fs.promises.mkdir(path.dirname(outputFile), { recursive: true })

	await generateBackgroundMusicInternal(outputFile, duration)

	console.log("🎵 Background music generated (NO VOICE)")
}
