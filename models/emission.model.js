const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const emissionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    clippings: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Clipping',
                required: true
            }
        ],
        required: true,
    }
}, {
    timestamps: true
})

const Emission = mongoose.model('Emission', emissionSchema, 'emission')
module.exports = Emission