const { oauth2Client } = require("../config/oauth")

exports.login = (req, res) => {
	const url = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/youtube.upload"],
		prompt: "consent",
	})

	console.log("🔑 AUTH URL:", url)
	res.redirect(url)
}

exports.callback = async (req, res) => {
	try {
		const { tokens } = await oauth2Client.getToken(req.query.code)

		oauth2Client.setCredentials(tokens)

		console.log("🔐 COPY THIS AND SAVE AS YOUTUBE_TOKENS ENV:")
		console.log(JSON.stringify(tokens))

		res.send(
			"✅ OAuth successful! Tokens printed in logs. Save them in Render ENV and redeploy."
		)
	} catch (err) {
		console.error("OAuth error:", err)
		res.status(500).send("OAuth failed")
	}
}
