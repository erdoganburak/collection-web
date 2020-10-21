/*const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const moneySchema = new Schema({
    productNo: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    condition: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0 || value > 10) {
                throw new Error('Condition must be between 1 to 10.')
            }
        }
    },
    serialNo: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Price must be a positive number')
            }
        }
    },
    emission: {
        type: Schema.Types.ObjectId,
        ref: 'Emission',
        required: true
    },
    clipping: {
        type: Schema.Types.ObjectId,
        ref: 'Clipping',
        required: true
    }
}, {
    timestamps: true
})

const Money = mongoose.model('Money', moneySchema, 'money')
module.exports = Money*/