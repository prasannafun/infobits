const fs = require("fs")
const path = require("path")
const { google } = require("googleapis")

/* =========================
   LOAD OAUTH CLIENT CONFIG
========================= */
const CREDENTIALS_PATH = path.join(__dirname, "oauth_client.json")

if (!fs.existsSync(CREDENTIALS_PATH)) {
	throw new Error("❌ oauth_client.json not found")
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"))
const oauthConfig = credentials.web || credentials.installed

if (!oauthConfig) {
	throw new Error("❌ Invalid OAuth client file")
}

const { client_id, client_secret, redirect_uris = [] } = oauthConfig

/* =========================
   CREATE OAUTH CLIENT
========================= */
const oauth2Client = new google.auth.OAuth2(
	client_id,
	client_secret,
	process.env.OAUTH_REDIRECT_URI ||
		redirect_uris[0] ||
		"http://localhost:3001/oauth2callback"
)

/* =========================
   LOAD TOKENS FROM ENV
========================= */
if (process.env.YOUTUBE_TOKENS) {
	try {
		const tokens = JSON.parse(process.env.YOUTUBE_TOKENS)
		oauth2Client.setCredentials(tokens)
		console.log("✅ YouTube OAuth tokens loaded from ENV")
	} catch (err) {
		console.error("❌ Failed to parse YOUTUBE_TOKENS", err)
	}
}

/* =========================
   YOUTUBE CLIENT
========================= */
const youtube = google.youtube({
	version: "v3",
	auth: oauth2Client,
})

module.exports = {
	oauth2Client,
	youtube,
}
