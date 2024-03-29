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

const actorSchema = Joi.object(
    {
        name: Joi.string().required(),
        biography: Joi.string().optional(),
        image: Joi.objectId().optional(),
    }
)

const directorSchema = Joi.object(
    {
        name: Joi.string().required(),
        biography: Joi.string().optional(),
        image: Joi.objectId().optional(),
    }
)

const categorySchema = Joi.object(
    {
        name: Joi.string().required()
    }
)

const orderSchema = Joi.object(
    {
        name: Joi.string().required(),
        email: Joi.string().email().lowercase().required(),
        address: Joi.string().required(),
        phone: Joi.string().required(),
        description: Joi.string().optional(),
        products: Joi.array().items(Joi.string()).required()
    }
)

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
        backImageId: Joi.objectId().optional(),
        status: Joi.number().min(1).max(2).required(),
        stock: Joi.number().min(0).required()
    }
)

const moneyFilterSchema = Joi.object(
    {
        productType: Joi.string().required(),
        productNo: Joi.string().allow('', null),
        name: Joi.string().allow('', null),
        condition: Joi.number().integer().allow(null).min(1).max(10),
        serialNo: Joi.string().allow('', null),
        minPrice: Joi.number().allow(null).min(0),
        maxPrice: Joi.number().allow(null).min(0),
        emission: Joi.string().allow(''),
        clippings: Joi.array().items(Joi.string()),
        status: Joi.number().min(0).max(2).required(),
        stock: Joi.number().allow(null).min(0),
        sort: Joi.string().allow(''),
        paginationRequest: Joi.object().keys({
            limit: Joi.number().min(0),
            skip: Joi.number().min(0),
        }).required()
    }
)

const movieSchema = Joi.object(
    {
        name: Joi.string().required(),
        duration: Joi.number().integer().min(0).required(),
        summary: Joi.string().required(),
        condition: Joi.number().integer().min(0).max(10).required(),
        actors: Joi.array().items(Joi.string()).required(),
        directors: Joi.array().items(Joi.string()).required(),
        categories: Joi.array().items(Joi.string()).required(),
        price: Joi.number().min(0).required(),
        productType: Joi.string().required(),
        frontImageId: Joi.objectId().optional(),
        year: Joi.number().allow(null).min(0).required(),
        format: Joi.number().allow(null).min(0).max(3).required(),
        status: Joi.number().min(1).max(2).required(),
        stock: Joi.number().min(0).required()
    }
)

const movieFilterSchema = Joi.object(
    {
        productType: Joi.string().required(),
        name: Joi.string().allow('', null),
        condition: Joi.number().integer().allow(null).min(1).max(10),
        minPrice: Joi.number().allow(null).min(0),
        maxPrice: Joi.number().allow(null).min(0),
        actors: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        categories: Joi.array().items(Joi.string()),
        year: Joi.number().allow(null),
        format: Joi.number().allow(null).min(0).max(3),
        status: Joi.number().min(0).max(2).required(),
        stock: Joi.number().allow(null).min(0),
        sort: Joi.string().allow(''),
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
    moneyFilterSchema,
    actorSchema,
    directorSchema,
    categorySchema,
    movieSchema,
    movieFilterSchema,
    orderSchema
}