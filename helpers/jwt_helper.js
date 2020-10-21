const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const client = require('./init_redis')
const uuid = require('./uuid')

// TODO change somewebsite

module.exports = {
    signAccessToken: (jwtId, userId) => {
        // jwt id is a random generated id. It is used to make multiple logins from same user from different devices.
        return new Promise((resolve, reject) => {
            const payload = {
                jwtId: jwtId
            }
            const secret = process.env.ACCESS_TOKEN_SECRET
            const options = {
                expiresIn: "1h",
                issuer: "somewebsite.com",
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken: (req, res, next) => {
        if (!req.headers['authorization']) {
            return next(createError.Unauthorized())
        }

        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) {
                const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })

    },
    signRefreshToken: (jwtId, userId) => {
        return new Promise((resolve, reject) => {
            const payload = { jwtId: jwtId }
            const secret = process.env.REFRESH_TOKEN_SECRET
            const options = {
                expiresIn: "1y",
                issuer: "somewebsite.com",
                audience: userId
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }

                client.SET(jwtId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    resolve(token)
                })
            })
        })
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                if (err) return reject(createError.Unauthorized())
                console.log(payload)
                const jwtId = payload.jwtId
                const userId = payload.aud
                client.GET(jwtId, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    if (refreshToken === result) {
                        return resolve({ jwtId, userId })
                    }
                    reject(createError.Unauthorized())
                })
            })
        })
    }
}