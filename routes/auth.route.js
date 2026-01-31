const router = require("express").Router()
const authController = require("../controllers/auth.controller")

router.get("/auth", authController.login)
router.get("/oauth2callback", authController.callback)

module.exports = router
