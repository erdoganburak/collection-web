const express = require('express')
const router = express.Router()
const EmissionController = require('../controllers/emission.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')

router.post('/save', verifyAccessToken, EmissionController.saveEmission)

router.delete('/delete/:id', verifyAccessToken, EmissionController.deleteEmission)

router.get('/get/:id', EmissionController.getEmissionById)

router.post('/get-all/', EmissionController.getEmissions)

router.patch('/update/:id', verifyAccessToken, EmissionController.updateEmission)

module.exports = router