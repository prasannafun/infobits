const { spawn } = require("child_process")

exports.getAudioDuration = (filePath) => {
	return new Promise((resolve, reject) => {
		const p = spawn("ffprobe", [
			"-v", "error",
			"-show_entries", "format=duration",
			"-of", "default=noprint_wrappers=1:nokey=1",
			filePath,
		])

		let out = ""
		let err = ""

		p.stdout.on("data", d => out += d.toString())
		p.stderr.on("data", d => err += d.toString())

		p.on("close", () => {
			const duration = parseFloat(out)

			if (!duration || isNaN(duration)) {
				return reject(
					`Invalid audio duration. ffprobe output="${out}" error="${err}"`
				)
			}

			resolve(duration)
		})
	})
}
