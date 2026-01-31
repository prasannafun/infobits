const fs = require("fs")
const { youtube } = require("../config/oauth")

exports.upload = async ({ filePath, title }) => {
	const upload = await youtube.videos.insert({
		part: ["snippet", "status"],
		requestBody: {
			snippet: {
				title,
				description: "Motivation Shorts | InfoBits",
				categoryId: "22",
			},
			status: {
				privacyStatus: "private",
			},
		},
		media: {
			body: fs.createReadStream(filePath),
		},
	})

    console.log('Video uploaded to YouTube with ID:', upload.data.id);

	return `https://youtube.com/watch?v=${upload.data.id}`
}
