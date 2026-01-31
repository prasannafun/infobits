const { oauth2Client, saveTokens } = require("../config/oauth")

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
		saveTokens(tokens)

		res.send("✅ OAuth successful! You can close this tab.")
	} catch (err) {
		console.error("OAuth error:", err)
		res.status(500).send("OAuth failed")
	}
}
