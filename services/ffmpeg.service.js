const { spawn } = require("child_process")

exports.renderVideo = ({
	videoUrl,
	voiceFile,
	lines,
	audioDuration,
	outputFile,
}) => {
	return new Promise((resolve, reject) => {
		if (!audioDuration || isNaN(audioDuration) || !lines?.length) {
			return reject("Invalid audio duration or empty text lines")
		}

		/* -----------------------
		   TEXT TIMING (SYNCED)
		----------------------- */
		const secPerLine = audioDuration / lines.length
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
			"-i", videoUrl,
			"-i", voiceFile,
			"-vf", filters,
			"-map", "0:v",
			"-map", "1:a",
			"-t", audioDuration.toFixed(2),

			// ✅ LINUX / RENDER SAFE
			"-c:v", "libx264",
			"-preset", "veryfast",
			"-pix_fmt", "yuv420p",

			"-c:a", "aac",
			"-movflags", "+faststart",
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
