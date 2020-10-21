const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)
//const { productType } = require('../constants/product-type.constant')

const authSchema = Joi.object(
    {
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().min(2).required()
    }
)

const clippingSchema = Joi.object(
    {
        quantity: Joi.number().min(0).required(),
    }
)

const emissionSchema = Joi.object(
    {
        name: Joi.string().required(),
        clippings: Joi.array().items(Joi.string()).required()
    }
)


// product: Joi.objectId().required()

const moneySchema = Joi.object(
    {
        price: Joi.number().min(0).required(),
        productType: Joi.string().required(),
        productNo: Joi.string().required(),
        name: Joi.string().required(),
        condition: Joi.number().integer().min(0).max(10).required(),
        serialNo: Joi.string().required(),
        emission: Joi.string().required(),
        clipping: Joi.string().required(),
        frontImageId: Joi.objectId().optional(),
        backImageId: Joi.objectId().optional()
    }
)

const moneyFilterSchema = Joi.object(
    {
        productType: Joi.string().required(),
        productNo: Joi.string().allow('').optional(),
        name: Joi.string().allow('').optional(),
        condition: Joi.number().integer().allow(null).min(1).max(10).optional(),
        serialNo: Joi.string().allow('').optional(),
        minPrice: Joi.number().allow(null).min(0).optional(),
        maxPrice: Joi.number().allow(null).min(0).optional(),
        emission: Joi.string().allow('').optional(),
        clipping: Joi.string().allow('').optional(),
        sort: Joi.string().allow('').optional(),
        paginationRequest: Joi.object().keys({
            limit: Joi.number().min(0),
            skip: Joi.number().min(0),
        }).required()
    }
)

module.exports = {
    authSchema,
    clippingSchema,
    emissionSchema,
    moneySchema,
    moneyFilterSchema
}