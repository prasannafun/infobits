const express = require("express")

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
