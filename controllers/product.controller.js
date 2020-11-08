
const createError = require('http-errors')
const Emission = require('../models/emission.model')
const Clipping = require('../models/clipping.model')
const Image = require('../models/image.model')
const { Money, Movie, Product } = require('../models/product.model')
const { moneySchema, moneyFilterSchema } = require('../helpers/validation_schema')
const mongoose = require('mongoose')

module.exports = {

    saveMovie: async (req, res, next) => {
        /*   try {
               req.body.productType = "Movie"
               if (req.files) {
                   if (req.files.mainImage) {
                       req.body.mainImage = req.files.mainImage[0].buffer;
                   }
                   if (req.files.images) {
                       req.body.images = [];
                       req.files.images.forEach(image => {
                           req.body.images.push(image.buffer);
                       });
                   }
               }
   
               const movie = new Movie(req.body)
               const savedMovie = await movie.save()
               savedMovie.frontImage = undefined;
               savedMovie.backImage = undefined;
               res.send(savedMovie)
           } catch (error) {
               if (error.isJoi === true) {
                   return next(createError.BadRequest())
               }
               next(error)
           }*/
    },

    saveMoney: async (req, res, next) => {
        try {
            req.body.productType = "Money"
            await moneySchema.validateAsync(req.body)

            req.body.frontImage = undefined;
            req.body.backImage = undefined;

            if (req.files) {
                if (req.files.frontImage) {
                    const fi = new Image({ image: req.files.frontImage[0].buffer })
                    const resultFrontImage = await fi.save();
                    req.body.frontImage = resultFrontImage._id;
                }

                if (req.files.backImage) {
                    const bi = new Image({ image: req.files.backImage[0].buffer })
                    const resultBackImage = await bi.save();
                    req.body.backImage = resultBackImage._id;
                }
            }

            const emission = await Emission.findById(req.body.emission);
            if (!emission) {
                throw createError.BadRequest('Emission id is not valid')
            }
            const clipping = await Clipping.findById(req.body.clipping);
            if (!clipping) {
                throw createError.BadRequest('Clipping id is not valid')
            }

            const money = new Money(req.body)
            const savedMoney = await money.save()
            res.send(savedMoney);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

    deleteProduct: async (req, res, next) => {
        try {
            const product = await Product.findOneAndDelete({ _id: req.params.id })

            if (!product) {
                throw createError.NotFound()
            }

            if (product.productType === "Money") {
                await Image.findByIdAndDelete(product.frontImage)
                await Image.findByIdAndDelete(product.backImage)
            }

            res.send(product)
        } catch (error) {
            next(error)
        }
    },

    getProductById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const product = await Product.findById(_id);
            if (!product) {
                throw createError.NotFound();
            }
            res.send(product);
        } catch (error) {
            next(error)
        }
    },

    getMoneyById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const money = await Money.findById(_id).populate('clipping').populate('emission').exec();
            if (!money) {
                throw createError.NotFound();
            }

            /*   const result = {
                   name: money.name,
                   price: money.price,
                   productNo: money.productNo,
                   serialNo: money.serialNo,
                   condition: money.condition,
                   clipping: money.clipping,
                   emission: money.emission
               }*/

            res.send(money);
        } catch (error) {
            next(error)
        }
    },

    getProducts: async (req, res, next) => {
        // TODO divide into functions
        try {
            switch (req.body.productType) {
                case "Money":
                    await moneyFilterSchema.validateAsync(req.body)

                    const match = {}
                    let sortOrder = process.env.SORT_ORDER;
                    let limit = Number(process.env.LIMIT);
                    let skip = Number(process.env.SKIP);

                    match.productType = req.body.productType;

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
                    if (req.body.clippings && req.body.clippings.length > 0) {
                        match.clipping = {
                            $in: req.body.clippings.map(function (id) { return new mongoose.Types.ObjectId(id); })
                        }
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

                    const moneys = await Product.aggregate([
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

                    if (moneys[0].totalData.length === 0) {
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
                    if (req.body.clippings && req.body.clippings.length > 0) {
                        // { "$match" : { "author": { "$in": userIds } } },
                        matchClipping._id = req.body.clippings;
                    }

                    paginationResponse.count = moneys[0].totalCount[0].count;

                    try {
                        await Product.populate(moneys[0].totalData, { path: 'emission', select: 'name', match: matchEmission })
                        await Clipping.populate(moneys[0].totalData, { path: 'clipping', select: 'quantity', match: matchClipping })

                        const result = {
                            moneys: moneys[0].totalData,
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
                    break;
                default:
                    res.send(createError.BadRequest())
                    break;
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
            const money = await Product.findOne({ _id: req.params.id })
            if (!money) {
                throw createError.NotFound()
            }

            req.body.productType = "Money";
            const result = await moneySchema.validateAsync(req.body)

            if (req.files) {
                if (req.files.frontImage) {
                    if (req.body.frontImageId) {
                        await Image.findByIdAndUpdate(req.body.frontImageId, { $set: { image: req.files.frontImage[0].buffer } }, { new: true })
                    } else {
                        const fi = new Image({ image: req.files.frontImage[0].buffer })
                        await fi.save();
                        result.frontImage = fi._id;
                    }
                }
                if (req.files.backImage) {
                    if (req.body.backImageId) {
                        await Image.findByIdAndUpdate(req.body.backImageId, { $set: { image: req.files.backImage[0].buffer } }, { new: true })
                    } else {
                        const bi = new Image({ image: req.files.backImage[0].buffer })
                        await bi.save();
                        result.backImage = bi._id;
                    }
                }
            }

            const updates = Object.keys(result)
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