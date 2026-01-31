require("dotenv").config()
const express = require("express")
const voiceService = require("./services/voice.service")

const renderRoutes = require("./routes/render.route")
const authRoutes = require("./routes/auth.route")

const app = express()
app.use(express.json())

app.use("/", authRoutes)
app.use("/", renderRoutes)

app.get("/", (_, res) => {
	res.send("🚀 FFmpeg + YouTube Automation Server Running")
})

app.listen(3001, () =>
	console.log("🚀 Server running on http://localhost:3001")
)

app.get("/test-voice", async (_, res) => {
	await voiceService.generateVoice(
		"Discipline beats motivation every single day.",
		"./test.mp3"
	)
	res.send("Voice generated")
})
