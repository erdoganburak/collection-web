const createError = require('http-errors')
const User = require('../models/user.model')
const { authSchema } = require('../helpers/validation_schema')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt_helper')
const client = require('../helpers/init_redis')
const moment = require('moment');
const uuid = require('../helpers/uuid')

module.exports = {
    register: async (req, res, next) => {
        console.log(req.body)
        try {
            const result = await authSchema.validateAsync(req.body)

            const doesExist = await User.findOne({ email: result.email })
            if (doesExist) {
                throw createError.Conflict('This email is already been registered')
            }
            const user = new User(result)
            const savedUser = await user.save()
            const jwtId = uuid.v4();
            const accessToken = await signAccessToken(jwtId, savedUser.id)
            const refreshToken = await signRefreshToken(jwtId, savedUser.id)
            const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS
            res.send({ accessToken, refreshToken, accessTokenExpiresIn })
        } catch (error) {
            if (error.isJoi === true) {
                error.status = 422
            }
            next(error)
        }
    },
    login: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)
            const user = await User.findOne({ email: result.email })
            if (!user) throw createError.NotFound("User not registered");

            const isMatch = await user.isValidPassword(result.password)
            if (!isMatch) throw createError.Unauthorized('Username/password not valid')

            const jwtId = uuid.v4();
            const accessToken = await signAccessToken(jwtId, user.id)
            const refreshToken = await signRefreshToken(jwtId, user.id)
            const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS

            res.send({ accessToken, refreshToken, accessTokenExpiresIn })
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest("Invalid Username/Password"))
            }
            next(error)
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) throw createError.BadRequest()
            const result = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(result.jwtId, result.userId)
            const refToken = await signRefreshToken(result.jwtId, result.userId)
            const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS
            res.send({ accessToken: accessToken, refreshToken: refToken, accessTokenExpiresIn: accessTokenExpiresIn })
        } catch (error) {
            next(error)
        }
    },
    logout: async (req, res, next) => {
        try {
            const { refreshToken } = req.body
            if (!refreshToken) {
                throw createError.BadRequest()
            }
            const result = await verifyRefreshToken(refreshToken)
            client.DEL(result.jwtId, (err, val) => {
                if (err) {
                    console.log(err.message)
                    throw createError.InternalServerError()
                }
                console.log(val)
                res.sendStatus(204)
            })
        } catch (error) {
            next(error)
        }
    }
}