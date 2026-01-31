const router = require("express").Router()
const renderController = require("../controllers/render.controller")

router.post("/render", renderController.renderVideo)

module.exports = router
