const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const actorSchema = new Schema({
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

const Actor = mongoose.model('Actor', actorSchema, 'actor')
module.exports = Actor