
const createError = require('http-errors')
const Emission = require('../models/emission.model')
const Clipping = require('../models/clipping.model')
const Director = require('../models/director.model')
const Actor = require('../models/actor.model')
const Category = require('../models/category.model')
const Image = require('../models/image.model')
const { Money, Movie, Product } = require('../models/product.model')
const { moneySchema, moneyFilterSchema, movieSchema, movieFilterSchema } = require('../helpers/validation_schema')
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

        try {
            req.body.productType = "Movie"
            await movieSchema.validateAsync(req.body)

            req.body.frontImage = undefined;

            if (req.files) {
                if (req.files.frontImage) {
                    const fi = new Image({ image: req.files.frontImage[0].buffer })
                    const resultFrontImage = await fi.save();
                    req.body.frontImage = resultFrontImage._id;
                }
            }

            const directors = await Director.find({ _id: { $in: req.body.directors } });
            if (directors.length !== req.body.directors.length) {
                throw createError.BadRequest('One of the directors ids is not valid')
            }

            const actors = await Actor.find({ _id: { $in: req.body.actors } });
            if (actors.length !== req.body.actors.length) {
                throw createError.BadRequest('One of the actors ids is not valid')
            }

            const categories = await Category.find({ _id: { $in: req.body.categories } });
            if (categories.length !== req.body.categories.length) {
                throw createError.BadRequest('One of the category ids is not valid')
            }

            const movie = new Movie(req.body)
            const savedMovie = await movie.save()
            res.send(savedMovie);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
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
            res.send(money);
        } catch (error) {
            next(error)
        }
    },
    getMovieById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const movie = await Movie.findById(_id).populate('actors').populate('directors').populate('categories').exec();
            if (!movie) {
                throw createError.NotFound();
            }
            res.send(movie);
        } catch (error) {
            next(error)
        }
    },
    getProducts: async (req, res, next) => {
        try {
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);
            let paginationResponse = {
                count: 0,
                skip: skip,
                limit: limit
            }
            const match = {}
            switch (req.body.productType) {
                case "Movie":
                    await movieFilterSchema.validateAsync(req.body)
                    match.productType = req.body.productType;
                    if (req.body.name) {
                        match.name = { $regex: req.body.name, $options: "i" }
                    }
                    if (req.body.condition) {
                        match.condition = req.body.condition;
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
                    if (req.body.directors && req.body.directors.length > 0) {
                        match.directors = {
                            $in: req.body.directors.map(function (id) { return new mongoose.Types.ObjectId(id); })
                        }
                    }

                    if (req.body.actors && req.body.actors.length > 0) {
                        match.actors = {
                            $in: req.body.actors.map(function (id) { return new mongoose.Types.ObjectId(id); })
                        }
                    }

                    if (req.body.categories && req.body.categories.length > 0) {
                        match.categories = {
                            $in: req.body.categories.map(function (id) { return new mongoose.Types.ObjectId(id); })
                        }
                    }

                    if (req.body.year) {
                        match.year = req.body.year;
                    }

                    if (req.body.format) {
                        match.format = req.body.format;
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

                    const movies = await Product.aggregate([
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
                                ]
                            }
                        }
                    ])

                    paginationResponse = {
                        count: 0,
                        skip: skip,
                        limit: limit
                    }

                    if (movies[0].totalData.length === 0) {
                        console.log("no movies found")
                        return res.send({
                            movies: [],
                            paginationResponse: paginationResponse
                        });
                    }

                    paginationResponse.count = movies[0].totalCount[0].count;

                    try {

                        await Director.populate(movies[0].totalData, { path: 'directors', select: 'name' })
                        await Actor.populate(movies[0].totalData, { path: 'actors', select: 'name' })
                        await Category.populate(movies[0].totalData, { path: 'categories', select: 'name' })

                        const result = {
                            movies: movies[0].totalData,
                            paginationResponse: paginationResponse
                        }
                        res.send(result);
                    } catch (error) {
                        res.send({
                            movies: [],
                            paginationResponse: paginationResponse
                        });
                    }
                    break;
                case "Money":
                    await moneyFilterSchema.validateAsync(req.body)
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

                    paginationResponse = {
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
            const result = await movieSchema.validateAsync(req.body)

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
    updateMovie: async (req, res, next) => {
        try {
            const movie = await Product.findOne({ _id: req.params.id })
            if (!movie) {
                throw createError.NotFound()
            }

            req.body.productType = "Movie";
            const result = await movieSchema.validateAsync(req.body)

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
            }

            const updates = Object.keys(result)
            updates.forEach(update => {
                movie[update] = result[update]
            });

            await movie.save()
            res.send(movie)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getMoviesByDirectorId: async (req, res, next) => {
        const _id = req.params.id
        try {
            const director = await Director.findById(_id).exec();
            if (!director) {
                throw createError.NotFound()
            }

            const movies = await Movie.find({ directors: { $in: _id } });

            const result = {
                director: director,
                movies: movies
            }
            res.send(result);
        } catch (error) {
            next(error)
        }
    },

}