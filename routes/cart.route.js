const express = require('express')
const router = express.Router()
const CartControlller = require('../controllers/cart.controller')

router.post('/add', CartControlller.addToCart)

router.delete('/remove', CartControlller.removeFromCart)

module.exports = router