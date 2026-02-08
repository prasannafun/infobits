require("dotenv").config()
const express = require("express")
const path = require("path")

const voiceService = require("./services/voice.service")
const renderRoutes = require("./routes/render.route")
const authRoutes = require("./routes/auth.route")

const app = express()
app.use(express.json())

// ✅ Serve static UI
app.use(express.static(path.join(__dirname, "public")))

app.get("/health", (req, res) => {
	res.set("Cache-Control", "no-store")
	res.end("OK")
})

// Routes
app.use("/", authRoutes)
app.use("/", renderRoutes)

// Test voice route (optional – you can remove in prod)
app.get("/test-voice", async (_, res) => {
	await voiceService.generateBackgroundMusic(
		"Discipline beats motivation every single day.",
		"./test.mp3"
	)
	res.send("Voice generated")
})

// ❌ 404 handler (must be LAST)
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, "public/404.html"))
})

app.listen(3001, () =>
	console.log("🚀 Server running on https://infobits.onrender.com")
)
