const express = require('express')
const router = express.Router()
const MoneyContoller = require('../controllers/money.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')

router.post('/save', verifyAccessToken, MoneyContoller.saveMoney)

router.delete('/delete/:id', verifyAccessToken, MoneyContoller.deleteMoney)

router.get('/get/:id', MoneyContoller.getMoneyById)

router.post('/filter', MoneyContoller.getMoneys)

router.patch('/update/:id', verifyAccessToken, MoneyContoller.updateMoney)

module.exports = router