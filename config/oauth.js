const { google } = require("googleapis")

/* =========================
   LOAD FROM ENV ONLY
========================= */

const client_id = process.env.YOUTUBE_CLIENT_ID
const client_secret = process.env.YOUTUBE_CLIENT_SECRET
const redirect_uri =
	process.env.OAUTH_REDIRECT_URI ||
	"https://infobits.onrender.com/oauth2callback"

if (!client_id || !client_secret) {
	throw new Error("❌ Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET")
}

/* =========================
   CREATE OAUTH CLIENT
========================= */
const oauth2Client = new google.auth.OAuth2(
	client_id,
	client_secret,
	redirect_uri
)

/* =========================
   LOAD TOKENS FROM ENV
========================= */
if (process.env.YOUTUBE_TOKENS) {
	try {
		const tokens = JSON.parse(process.env.YOUTUBE_TOKENS)
		oauth2Client.setCredentials(tokens)
		console.log("✅ YouTube OAuth tokens loaded from ENV")
		console.log("CLIENT:", client_id)
console.log("SECRET EXISTS:", !!client_secret)
console.log("TOKENS EXISTS:", !!process.env.YOUTUBE_TOKENS)

	} catch (err) {
		console.error("❌ Failed to parse YOUTUBE_TOKENS", err)
	}
} else {
	console.warn("⚠️ No YOUTUBE_TOKENS found in ENV")
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
