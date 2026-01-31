const fs = require("fs")

exports.safeDelete = (filePath) => {
	if (!filePath) return
	if (!fs.existsSync(filePath)) return

	try {
		fs.unlinkSync(filePath)
		console.log("🧹 Deleted:", filePath)
	} catch (err) {
		console.warn("⚠️ Cleanup failed:", filePath)
	}
}
