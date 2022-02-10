const express = require('express')
const router = express.Router()
const OrderContoller = require('../controllers/order.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')

router.post('/save-order', OrderContoller.saveOrder)

router.get('/get/:id', verifyAccessToken, OrderContoller.getOrderById)

router.post('/filter', verifyAccessToken, OrderContoller.getOrders)

module.exports = router