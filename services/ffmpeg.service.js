const fs = require("fs")
const path = require("path")
const { spawn } = require("child_process")

const MUSIC_DIR = path.join(__dirname, "../music")

function getRandomMusicFile() {
	const files = fs
		.readdirSync(MUSIC_DIR)
		.filter((f) => f.endsWith(".mp3") || f.endsWith(".wav"))
	if (!files.length) throw new Error("No music files found")
	return path.join(MUSIC_DIR, files[Math.floor(Math.random() * files.length)])
}

exports.renderVideo = ({
	videoUrl,
	lines,
	outputFile,
	duration = 15,
}) => {
	return new Promise((resolve, reject) => {
		if (!lines?.length) {
			return reject("Empty text lines")
		}

		const musicFile = getRandomMusicFile()

		/* -----------------------
		   TEXT TIMING
		----------------------- */
		const secPerLine = duration / lines.length
		let t = 0

		const textFilters = lines
			.map((line) => {
				const safeLine = line
					.replace(/:/g, "\\:")
					.replace(/'/g, "\\'")
					.replace(/,/g, "\\,")

				const start = t
				const end = t + secPerLine
				t = end

				return (
					`drawtext=text='${safeLine}':` +
					`fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:` +
					`fontsize=60:` +
					`fontcolor=white:` +
					`box=1:` +
					`boxcolor=black@0.4:` +
					`boxborderw=20:` +
					`x=(w-text_w)/2:` +
					`y=(h-text_h)/2:` +
					`enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`
				)
			})
			.join(",")

		const filters =
			`scale=720:1280:force_original_aspect_ratio=increase,` +
			`crop=720:1280,` +
			textFilters

		const args = [
			"-y",

			// Input video
			"-i",
			videoUrl,

			// Loop music
			"-stream_loop",
			"-1",
			"-i",
			musicFile,

			// Video filters
			"-vf",
			filters,

			// Audio
			"-filter:a",
			"volume=0.15",

			// Mapping
			"-map",
			"0:v:0",
			"-map",
			"1:a:0",

			// Duration
			"-t",
			duration.toFixed(2),

			"-shortest",

			// ⚡ FAST ENCODING SETTINGS
			"-c:v",
			"libx264",
			"-preset",
			"ultrafast",      // MUCH faster
			"-crf",
			"28",             // Slightly lower quality but faster
			"-pix_fmt",
			"yuv420p",
			"-threads",
			"2",

			"-c:a",
			"aac",
			"-b:a",
			"128k",

			"-movflags",
			"+faststart",

			outputFile,
		]

		console.log("Running FFmpeg...")

		const ff = spawn("ffmpeg", args)

		ff.stderr.on("data", (d) => {
			console.log(d.toString())
		})

		ff.on("close", (code) => {
			if (code !== 0) return reject("FFmpeg failed")
			console.log("Video render complete")
			resolve()
		})
	})
}
