
const { categorySchema } = require('../helpers/validation_schema')
const Category = require('../models/category.model')
const { Movie } = require('../models/product.model')

const createError = require('http-errors')

module.exports = {
    saveCategory: async (req, res, next) => {
        try {
            await categorySchema.validateAsync(req.body)
            const category = new Category(req.body)
            const savedCategory = await category.save()
            res.send(savedCategory);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            const category = await Category.findOneAndDelete({ _id: req.params.id })
            if (!category) {
                throw createError.NotFound()
            }
            // Find the deleted category in movies and delete the category reference in movies as well.

            await Movie.updateMany({}, { $pullAll: { categories: [req.params.id] } })

            res.send(category)
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getCategoryById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const category = await Category.findById(_id).exec();
            if (!category) {
                throw createError.NotFound();
            }
            res.send(category);
        } catch (error) {
            next(error)
        }
    },
    getCategories: async (req, res, next) => {
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

            const categories = await Category.aggregate([
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

            if (categories[0].totalData.length === 0) {
                console.log("no categories found")
                return res.send({
                    categories: [],
                    paginationResponse: paginationResponse
                });
            }

            paginationResponse.count = categories[0].totalCount[0].count;

            const result = {
                categories: categories[0].totalData,
                paginationResponse: paginationResponse
            }

            res.send(result);

        } catch (error) {
            next(error)
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const category = await Category.findOne({ _id: req.params.id })
            if (!category) {
                throw createError.NotFound()
            }

            const result = await categorySchema.validateAsync(req.body)

            const updates = Object.keys(result)
            updates.forEach(update => {
                category[update] = result[update]
            });

            await category.save()
            res.send(category)

        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },

}