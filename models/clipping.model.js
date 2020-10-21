const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const clippingSchema = new Schema({
    quantity: {
        type: Number,
        required: true,
        unique: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Clipping must be a positive number')
            }
        }
    }
}, {
    timestamps: true
})

const Clipping = mongoose.model('Clipping', clippingSchema, 'clipping')
module.exports = Clipping