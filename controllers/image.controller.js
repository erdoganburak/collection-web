
const Image = require('../models/image.model')
const createError = require('http-errors')

module.exports = {
    getImageById: async (req, res, next) => {
        const _id = req.params.id;
        try {
            const image = await Image.findById(_id).exec();
            if (!image) {
                throw createError.NotFound();
            }
            res.set('Content-Type', 'image/jpg')
            res.send(image.image);
        } catch (error) {
            next(error)
        }
    }
}