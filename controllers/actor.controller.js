
const { actorSchema } = require('../helpers/validation_schema')
const Actor = require('../models/actor.model')
const Image = require('../models/image.model')
const createError = require('http-errors')

module.exports = {
    saveActor: async (req, res, next) => {
        try {
            /*  if (req.files) {
                     let images = [];
                     req.files.forEach(file => {
                         const objectId = new mongoose.Types.ObjectId();
                         images.push(new Image({ _id: objectId, image: file[0].buffer }));
                         req.body.images.push(objectId);
                     });
     
                     await Image.insertMany(images);
                 }*/

            // await moneySchema.validateAsync(req.body)
            await actorSchema.validateAsync(req.body)

            req.body.image = undefined;

            if (req.files) {
                if (req.files.image) {
                    const fi = new Image({ image: req.files.image[0].buffer })
                    const resultImage = await fi.save();
                    req.body.image = resultImage._id;
                }
            }

            const actor = new Actor(req.body)
            const savedActor = await actor.save()
            res.send(savedActor);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteActor: async (req, res, next) => {
        try {
            const actor = await Actor.findOneAndDelete({ _id: req.params.id })
            if (!actor) {
                throw createError.NotFound()
            }
            res.send(actor)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

    getActorById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const actor = await Actor.findById(_id).exec();
            if (!actor) {
                throw createError.NotFound();
            }
            res.send(actor);
        } catch (error) {
            next(error)
        }
    },
    getActors: async (req, res, next) => {
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

            const actors = await Actor.aggregate([
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

            if (actors[0].totalData.length === 0) {
                console.log("no actors found")
                return res.send({
                    actors: [],
                    paginationResponse: paginationResponse
                });
            }

            paginationResponse.count = actors[0].totalCount[0].count;

            const result = {
                actors: actors[0].totalData,
                paginationResponse: paginationResponse
            }

            res.send(result);

        } catch (error) {
            next(error)
        }
    },

    updateActor: async (req, res, next) => {
        try {
            const actor = await Actor.findOne({ _id: req.params.id })
            if (!actor) {
                throw createError.NotFound()
            }

            const result = await actorSchema.validateAsync(req.body)

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
                actor[update] = result[update]
            });

            await actor.save()
            res.send(actor)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}