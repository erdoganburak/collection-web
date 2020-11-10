const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    }
}, {
    timestamps: true
})

const Category = mongoose.model('Category', categorySchema, 'category')
module.exports = Category