
const { clippingSchema } = require('../helpers/validation_schema')
const createError = require('http-errors')
const Clipping = require('../models/clipping.model')

module.exports = {
    saveClipping: async (req, res, next) => {
        console.log(req.body)
        try {
            const result = await clippingSchema.validateAsync(req.body)
            const doesExist = await Clipping.findOne({ quantity: result.quantity })
            if (doesExist) {
                throw createError.Conflict('This clipping is already saved before...')
            }

            const clipping = new Clipping(result)
            const savedClipping = await clipping.save()
            res.send(savedClipping);

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteClipping: async (req, res, next) => {
        try {
            const clipping = await Clipping.findOneAndDelete({ _id: req.params.id })
            if (!clipping) {
                throw createError.NotFound()
            }
            res.send(clipping)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getClippingById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const clipping = await Clipping.findById(_id);
            if (!clipping) {
                throw createError.NotFound();
            }
            res.send(clipping);
        } catch (error) {
            next(error)
        }
    },
    getClippings: async (req, res, next) => {
        try {
            const match = {}
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);

            if (req.body.quantity) {
                console.log(req.body.quantity)
                match.quantity = Number(req.body.quantity)
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


            const clippings = await Clipping.aggregate([
                { $match: match },
                {
                    $sort: { 'quantity': sortOrder }
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
                count: clippings[0].totalCount[0] ? clippings[0].totalCount[0].count : 0,
                skip: skip,
                limit: limit
            }


            res.send({
                clippings: clippings[0].totalData,
                paginationResponse: paginationResponse
            });


            /* 
            
            let query = {};
 
            await Clipping.aggregate([
                 { $match: match }
             ])
                 skip(skip).limit(limit).sort({
                     quantity: sortOrder
                 }).exec((err, doc) => {
                     if (err) {
                         res.json(err + "error")
                     } else {
 
                         Clipping.countDocuments(query).exec((count_error, count) => {
                             if (err) {
                                 return res.json(count_error);
                             }
 
                             return res.send({
                                 clippings: doc,
                                 paginationResponse: {
                                     count: count,
                                     skip: skip,
                                     limit: limit
                                 }
                             });
                         });
                     }
                 })*/


        } catch (error) {
            next(error)
        }
    },
    updateClipping: async (req, res, next) => {
        try {
            const clipping = await Clipping.findOne({ _id: req.params.id })
            if (!clipping) {
                throw createError.NotFound()
            }

            const result = await clippingSchema.validateAsync(req.body)

            const updates = Object.keys(result)
            updates.forEach(update => {
                clipping[update] = result[update]
            });

            await clipping.save()
            res.send(clipping)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}