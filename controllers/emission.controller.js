
const { emissionSchema } = require('../helpers/validation_schema')
const Emission = require('../models/emission.model')
const createError = require('http-errors')
const Clipping = require('../models/clipping.model')

module.exports = {
    saveEmission: async (req, res, next) => {
        console.log(req.body)
        try {
            const result = await emissionSchema.validateAsync(req.body)
            const doesExist = await Emission.findOne({ name: result.name })
            if (doesExist) {
                throw createError.Conflict('This emission is already saved before...')
            }

            await Promise.all(req.body.clippings.map(async clipping => {
                console.log("asd " + clipping)

                const doesClippingExist = await Clipping.findOne({ _id: clipping });
                if (!doesClippingExist) {
                    throw createError.Conflict('Clipping with id ' + clipping + ' does not exist')
                } else {
                    return Promise.resolve();
                }
            }));
            const emission = new Emission(result)
            const savedEmission = await emission.save()
            res.send(savedEmission);

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteEmission: async (req, res, next) => {
        try {
            const emission = await Emission.findOneAndDelete({ _id: req.params.id })
            if (!emission) {
                throw createError.NotFound()
            }
            res.send(emission)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getEmissionById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const emission = await Emission.findById(_id).populate('clippings').exec();
            if (!emission) {
                throw createError.NotFound();
            }
            res.send(emission);
        } catch (error) {
            next(error)
        }
    },
    getEmissions: async (req, res, next) => {
        try {
            const match = {}
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);

            if (req.body.name) {
                console.log(req.body.name)
                match.name = Number(req.body.name)
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

            // const emissions = await Emission.find({}).populate('clippings').exec();

            const emissions = await Emission.aggregate([
                { $match: match },
                {
                    $sort: { 'name': sortOrder }
                },
                {
                    $facet: {
                        totalData: [
                            { $skip: skip },
                            { $limit: limit },
                            { $project: { "createdAt": 0, "updatedAt": 0, "__v": 0 } }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ],

                    }
                }
            ])

            const paginationResponse = {
                count: 0,
                skip: skip,
                limit: limit
            }

            if (emissions[0].totalData.length === 0) {
                console.log("no emissions found")
                return res.send({
                    emissions: [],
                    paginationResponse: paginationResponse
                });
            }

            paginationResponse.count = emissions[0].totalCount[0].count;

            try {
                await Clipping.populate(emissions[0].totalData, { path: 'clippings', select: ['_id', 'quantity'] })
                const result = {
                    emissions: emissions[0].totalData,
                    paginationResponse: paginationResponse
                }
                res.send(result);
            } catch (error) {
                res.send({
                    emissions: [],
                    paginationResponse: paginationResponse
                });
            }
        } catch (error) {
            next(error)
        }
    },
    updateEmission: async (req, res, next) => {
        try {
            const emission = await Emission.findOne({ _id: req.params.id })
            if (!emission) {
                throw createError.NotFound()
            }

            const result = await emissionSchema.validateAsync(req.body)

            await Promise.all(req.body.clippings.map(async (clipping) => {
                const doesClippingExist = await Clipping.findOne({ _id: clipping });
                if (!doesClippingExist) {
                    throw createError.Conflict('Clipping with id ' + clipping + ' does not exist')
                }
            }));

            const updates = Object.keys(result)
            updates.forEach(update => {
                emission[update] = result[update]
            });
            await emission.save()
            res.send(emission)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}