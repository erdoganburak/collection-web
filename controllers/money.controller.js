
const { moneySchema, moneyFilterSchema } = require('../helpers/validation_schema')
const Money = require('../models/money.model')
const Emission = require('../models/emission.model')
const Clipping = require('../models/clipping.model')
const createError = require('http-errors')
const mongoose = require('mongoose')

module.exports = {
    saveMoney: async (req, res, next) => {
        console.log(req.body)
        try {
            const result = await moneySchema.validateAsync(req.body)
            const emission = await Emission.findById(req.body.emission);
            if (!emission) {
                throw createError.BadRequest('Emission id is not valid')
            }
            const clipping = await Clipping.findById(req.body.clipping);
            if (!clipping) {
                throw createError.BadRequest('Clipping id is not valid')
            }
            const money = new Money(result)
            const savedMoney = await money.save()
            res.send(savedMoney);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteMoney: async (req, res, next) => {
        try {
            const money = await Money.findOneAndDelete({ _id: req.params.id })
            if (!money) {
                throw createError.NotFound()
            }
            res.send(money)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getMoneyById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const money = await (await Money.findById(_id).populate('emission').populate('clipping').exec());
            if (!money) {
                throw createError.NotFound();
            }
            res.send(money);
        } catch (error) {
            next(error)
        }
    },
    getMoneys: async (req, res, next) => {
        try {
            await moneyFilterSchema.validateAsync(req.body)

            const match = {}
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);

            if (req.body.productNo) {
                match.productNo = req.body.productNo;
            }
            if (req.body.name) {
                match.name = { $regex: req.body.name, $options: "i" }
            }
            if (req.body.condition) {
                match.condition = req.body.condition;
            }
            if (req.body.serialNo) {
                match.serialNo = req.body.serialNo;
            }
            if (req.body.minPrice) {
                match.price = {
                    $gt: req.body.minPrice
                }
            }
            if (req.body.maxPrice) {
                match.price = {
                    $lte: req.body.maxPrice
                }
            }
            if (req.body.clipping) {
                match.clipping = mongoose.Types.ObjectId(req.body.clipping)
            }
            if (req.body.emission) {
                match.emission = mongoose.Types.ObjectId(req.body.emission)
            }
            if (req.body.sort === 'desc') {
                sortOrder = -1;
            }
            if (req.body.paginationRequest.limit) {
                limit = req.body.paginationRequest.limit;
            }
            if (req.body.paginationRequest.skip) {
                skip = req.body.paginationRequest.skip;
            }
            const moneys = await Money.aggregate([
                { $match: match }
            ]).skip(skip).limit(limit).sort({
                createdAt: sortOrder
            }).exec();

            if (!moneys) {
                console.log("no money found")
                return res.send({
                    moneys: [],
                    paginationResponse: paginationResponse
                });
            }

            const matchEmission = {}
            if (req.body.emission) {
                matchEmission._id = req.body.emission;
            }

            const matchClipping = {}
            if (req.body.clipping) {
                matchClipping._id = req.body.clipping;
            }

            const paginationResponse = {
                count: moneys.length,
                skip: skip,
                limit: limit
            }

            try {
                await Money.populate(moneys, { path: 'emission', match: matchEmission })
                await Clipping.populate(moneys, { path: 'clipping', match: matchClipping })
                const result = {
                    moneys: moneys,
                    paginationResponse: paginationResponse
                }
                res.send(result);
            } catch (error) {
                res.send({
                    moneys: [],
                    paginationResponse: paginationResponse
                });
                // throw createError.InternalServerError('Cannot populate emission')
            }

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest(error))
            }
            next(error)
        }
    },
    updateMoney: async (req, res, next) => {
        try {
            const updates = Object.keys(req.body)
            const allowedUpdates = ['productNo', 'name', 'condition', 'serialNo', 'price', 'emission', 'clipping'];
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

            if (!isValidOperation) {
                return createError.BadRequest('Invalid updates!')
            }

            const money = await Money.findById(req.params.id)
            if (!money) {
                throw createError.NotFound('Money is not valid')
            }

            const emission = await Emission.findById(req.body.emission)
            if (!emission) {
                throw createError.NotFound('Emission is not valid')
            }

            const clipping = await Clipping.findById(req.body.clipping)
            if (!clipping) {
                throw createError.NotFound('Clipping is not valid')
            }

            const result = await moneySchema.validateAsync(req.body)

            updates.forEach(update => {
                money[update] = result[update]
            });
            await money.save()
            res.send(money)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}