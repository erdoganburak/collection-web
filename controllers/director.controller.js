
const { directorSchema } = require('../helpers/validation_schema')
const Director = require('../models/director.model')
const Image = require('../models/image.model')
const createError = require('http-errors')

module.exports = {
    saveDirector: async (req, res, next) => {
        try {
            await directorSchema.validateAsync(req.body)

            req.body.image = undefined;

            if (req.files) {
                if (req.files.image) {
                    const fi = new Image({ image: req.files.image[0].buffer })
                    const resultImage = await fi.save();
                    req.body.image = resultImage._id;
                }
            }

            const director = new Director(req.body)
            const savedDirector = await director.save()
            res.send(savedDirector);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteDirector: async (req, res, next) => {
        try {
            const director = await Director.findOneAndDelete({ _id: req.params.id })
            if (!director) {
                throw createError.NotFound()
            }
            res.send(director)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

    getDirectorById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const director = await Director.findById(_id).exec();
            if (!director) {
                throw createError.NotFound();
            }
            res.send(director);
        } catch (error) {
            next(error)
        }
    },
    getDirectors: async (req, res, next) => {
        try {
            const match = {}
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);

            if (req.body.name) {
                console.log(req.body.name)
                match.name = { $regex: req.body.name, $options: "i" }
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

            const directors = await Director.aggregate([
                { $match: match },
                {
                    $sort: { 'createdAt': sortOrder }
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

            if (directors[0].totalData.length === 0) {
                console.log("no directors found")
                return res.send({
                    directors: [],
                    paginationResponse: paginationResponse
                });
            }

            paginationResponse.count = directors[0].totalCount[0].count;

            const result = {
                directors: directors[0].totalData,
                paginationResponse: paginationResponse
            }

            res.send(result);

        } catch (error) {
            next(error)
        }
    },

    updateDirector: async (req, res, next) => {
        try {
            const director = await Director.findOne({ _id: req.params.id })
            if (!director) {
                throw createError.NotFound()
            }

            const result = await directorSchema.validateAsync(req.body)

            if (req.files) {
                if (req.files.image) {
                    if (req.body.image) {
                        await Image.findByIdAndUpdate(req.body.image, { $set: { image: req.files.image[0].buffer } }, { new: true })
                    } else {
                        const fi = new Image({ image: req.files.image[0].buffer })
                        await fi.save();
                        result.image = fi._id;
                    }
                }
            }

            const updates = Object.keys(result)
            updates.forEach(update => {
                director[update] = result[update]
            });

            await director.save()
            res.send(director)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}