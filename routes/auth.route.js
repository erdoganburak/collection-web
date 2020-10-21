const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth.controller')
const limitter = require('express-rate-limit')

// TODO change these values
// 10 register requests per 5 minutes
const registerLimitter = limitter({
    windowMs: 5 * 60 * 1000,
    max: 10
})

const loginLimit = limitter({
    windowMs: 1 * 60 * 1000,
    max: 100
})

const refreshTokenLimit = limitter({
    windowMs: 1 * 60 * 1000,
    max: 100
})

const logoutLimit = limitter({
    windowMs: 1 * 60 * 1000,
    max: 100
})

router.post('/register', registerLimitter, AuthController.register)

router.post('/login', loginLimit, AuthController.login)

router.post('/refresh-token', refreshTokenLimit, AuthController.refreshToken)

router.delete('/logout', logoutLimit, AuthController.logout)

module.exports = router