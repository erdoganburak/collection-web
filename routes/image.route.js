const express = require('express')
const router = express.Router()
const imageController = require('../controllers/image.controller')

router.get('/get-image/:id', imageController.getImageById)

module.exports = router