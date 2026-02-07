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
	duration = 15, // default Shorts duration
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
				const start = t
				const end = t + secPerLine
				t = end

				return (
					`drawtext=text='${line}':` +
					`fontfile=fonts/Montserrat-Bold.ttf:` +
					`fontsize=64:` +
					`fontcolor=white:` +
					`box=1:` +
					`boxcolor=black@0.35:` +
					`boxborderw=24:` +
					`x=(w-text_w)/2:` +
					`y=(h-text_h)/2:` +
					`enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`
				)
			})
			.join(",")

		const filters =
			`scale=1080:1920:force_original_aspect_ratio=increase,` +
			`crop=1080:1920,` +
			textFilters

		const args = [
			"-y",

			// Video
			"-i",
			videoUrl,

			// Background music (looped)
			"-stream_loop",
			"-1",
			"-i",
			musicFile,

			// Video filters
			"-vf",
			filters,

			// Audio volume + trim
			"-filter:a",
			"volume=0.15",

			"-map",
			"0:v:0",
			"-map",
			"1:a:0",

			"-t",
			duration.toFixed(2),

			// Linux-safe encoding
			"-c:v",
			"libx264",
			"-preset",
			"veryfast",
			"-pix_fmt",
			"yuv420p",

			"-c:a",
			"aac",
			"-movflags",
			"+faststart",

			outputFile,
		]

		const ff = spawn("ffmpeg", args)

		ff.stderr.on("data", (d) => console.log(d.toString()))

		ff.on("close", (code) => {
			if (code !== 0) return reject("FFmpeg failed")
			resolve()
		})
	})
}
