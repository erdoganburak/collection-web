const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    image: {
        type: Buffer,
    }
}, {
    timestamps: true
})

const Image = mongoose.model('Image', imageSchema, 'image')
module.exports = Image