
const createError = require('http-errors')
const client = require('../helpers/init_redis')
const uuid = require('../helpers/uuid')
const { cartSchema } = require('../helpers/validation_schema')

module.exports = {
    addToCart: async (req, res, next) => {
        try {
            console.log(req.body)
            if (!req.body.productId) {
                reject(createError.BadRequest())
            }
            if (req.body.id) {
                client.GET(req.body.id, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                    }
                    let value = JSON.parse(result);
                    value.push(req.body.productId)
                    client.SET(req.body.id, JSON.stringify(value), (err, reply) => {
                        if (err) {
                            console.log(err.message)
                            reject(createError.InternalServerError())
                        }
                        res.send(reply)
                    })
                })

            } else {
                const cartId = uuid.v4();
                const value = JSON.stringify([req.body.productId]);
                client.SET(cartId, value, 'EX', 24 * 60 * 60, (err, reply) => {
                    if (err) {
                        console.log(err.message)
                        throw createError.InternalServerError()
                    }
                    res.send(cartId)
                })
            }
        } catch (error) {
            next(error)
        }

    },
    removeFromCart: async (req, res, next) => {

        try {
            console.log(req.body)
            if (!req.body.id) {
                reject(createError.BadRequest())
            }

            if (!req.body.productId) {
                reject(createError.BadRequest())
            }

            client.GET(req.body.id, (err, result) => {
                if (err) {
                    console.log(err.message)
                    throw createError.NotFound()
                }

                client.DEL(req.body.id, (err, result) => {
                    if (err) {
                        console.log(err.message)
                        throw createError.InternalServerError()
                    }
                })
            })

        } catch (error) {
            next(error)
        }
    }

}