const fs = require("fs")
const { youtube, oauth2Client } = require("../config/oauth")

exports.upload = async ({ filePath, title, description, tags }) => {
	if (
		!oauth2Client.credentials ||
		!oauth2Client.credentials.refresh_token
	) {
		throw new Error("YouTube OAuth not authenticated. Visit /auth")
	}

	const upload = await youtube.videos.insert({
		part: ["snippet", "status"],
		requestBody: {
			snippet: {
				title,
				description,
				tags,
				categoryId: "22", // People & Blogs
			},
			status: {
				privacyStatus: "private",
				selfDeclaredMadeForKids: false,
			},
		},
		media: {
			body: fs.createReadStream(filePath),
		},
	})

	return `https://youtube.com/watch?v=${upload.data.id}`
}
