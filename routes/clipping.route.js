const express = require('express')
const router = express.Router()
const ClippingContoller = require('../controllers/clipping.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')

router.post('/save', verifyAccessToken, ClippingContoller.saveClipping)

router.delete('/delete/:id', verifyAccessToken, ClippingContoller.deleteClipping)

router.get('/get/:id', ClippingContoller.getClippingById)

router.post('/get-all/', ClippingContoller.getClippings)

router.patch('/update/:id', verifyAccessToken, ClippingContoller.updateClipping)

module.exports = router