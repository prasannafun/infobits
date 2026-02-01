const fs = require("fs")
const path = require("path")
const { google } = require("googleapis")

/* =========================
   PATHS
========================= */
const CREDENTIALS_PATH = path.join(__dirname, "oauth_client.json")
const TOKEN_PATH = path.join(__dirname, "tokens.json")

/* =========================
   LOAD CREDENTIALS
========================= */
if (!fs.existsSync(CREDENTIALS_PATH)) {
	throw new Error("❌ oauth_client.json not found")
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"))
const oauthConfig = credentials.web || credentials.installed

if (!oauthConfig) {
	throw new Error("❌ Invalid OAuth client file")
}

const {
	client_id,
	client_secret,
	redirect_uris = [],
} = oauthConfig

/* =========================
   OAUTH CLIENT
========================= */
const oauth2Client = new google.auth.OAuth2(
	client_id,
	client_secret,
	process.env.OAUTH_REDIRECT_URI ||
	redirect_uris[0] ||
	"https://infobits.onrender.com/oauth2callback"
)

/* =========================
   TOKEN HANDLING
========================= */
function loadTokens() {
	if (!fs.existsSync(TOKEN_PATH)) return null
	return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"))
}

function saveTokens(tokens) {
	fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2))
}

const tokens = loadTokens()
if (tokens) {
	oauth2Client.setCredentials(tokens)
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
	TOKEN_PATH,
	saveTokens,
}
