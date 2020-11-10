const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const directorSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    biography: {
        type: String,
        trim: true
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }
}, {
    timestamps: true
})

const Director = mongoose.model('Director', directorSchema, 'director')
module.exports = Director