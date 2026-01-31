const { spawn } = require("child_process")

exports.generateVoice = (text, output) => {
	return new Promise((resolve, reject) => {
		const say = spawn("say", [
			"-v",
			"Samantha",
			"-o",
			output,
			"--data-format=LEI16@44100",
			text,
		])

		say.on("close", resolve)
		say.on("error", reject)
	})
}
