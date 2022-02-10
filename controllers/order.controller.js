
const { actorSchema: orderSchema } = require('../helpers/validation_schema')
const Order = require('../models/order.model')
const { Product } = require('../models/product.model')
const createError = require('http-errors')

module.exports = {
    saveOrder: async (req, res, next) => {
        try {
            await orderSchema.validateAsync(req.body)

            // Check if products are still in stock and open for sale
            // TODO Is transaction needed for this? Ask Erdem

            const _ids = req.body.products
            _ids.forEach(id => {
                if (!mongoose.Types.ObjectId.isValid(id)) throw createError.BadRequest("Invalid id!");
            });
            const products = await Product.find({
                '_id': {
                    $in: _ids
                }
            }, '-__v -createdAt -updatedAt')

            if (!products) {
                throw createError.NotFound();
            }

            products.forEach(product => {
                if (product.status !== 1 || product.stock <= 0) {
                    throw createError.Forbidden("One of the items in product list is out of stock or not available for sale anymore.");
                }
            });

            const order = new Order(req.body)
            const savedOrder = await order.save()
            res.send(savedOrder);
        } catch (error) {
            if (error.isJoi === true) {
                return next(createError.BadRequest())
            }
            next(error)
        }
    },
    getOrderById: async (req, res, next) => {
        const _id = req.params.id
        try {
            const order = await Order.findById(_id).exec();
            if (!order) {
                throw createError.NotFound();
            }
            res.send(order);
        } catch (error) {
            next(error)
        }
    },
    getOrders: async (req, res, next) => {
        try {
            const match = {}
            let sortOrder = process.env.SORT_ORDER;
            let limit = Number(process.env.LIMIT);
            let skip = Number(process.env.SKIP);

            if (req.body.name) {
                console.log(req.body.name)
                match.name = { $regex: req.body.name, $options: "i" }
            }

            if (req.body.email) {
                console.log(req.body.email)
                match.email = { $regex: req.body.email, $options: "i" }
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

            const orders = await Order.aggregate([
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

            if (orders[0].totalData.length === 0) {
                console.log("no orders found")
                return res.send({
                    actors: [],
                    paginationResponse: paginationResponse
                });
            }

            paginationResponse.count = orders[0].totalCount[0].count;

            const result = {
                orders: orders[0].totalData,
                paginationResponse: paginationResponse
            }

            res.send(result);

        } catch (error) {
            next(error)
        }
    }
}