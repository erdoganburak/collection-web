const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    products: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        ],
        required: true,
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema, 'order')
module.exports = Order