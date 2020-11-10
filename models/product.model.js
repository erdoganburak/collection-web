const mongoose = require('mongoose');
const { discriminator } = require('./money.model');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Price must be a positive number')
            }
        }
    },
},
    {
        timestamps: true,
        discriminatorKey: 'productType',
        id: false,
        toJSON: {
            getters: true,
            virtuals: true
        },
        toObject: {
            getters: true,
            virtuals: true
        }
    },
)

const movieSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    /*  images: [
          {
              type: Buffer
          }
      ],*/
    duration: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Duration must be a positive number')
            }
        }
    },
    summary: {
        type: String,
        trim: true,
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
    actors: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Actor',
                required: true
            }
        ],
        required: true,
    },
    directors: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Director',
                required: true
            }
        ],
        required: true,
    },
    categories: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Category',
                required: true
            }
        ],
        required: true,
    }
})

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
    emission: {
        type: Schema.Types.ObjectId,
        ref: 'Emission',
        required: true
    },
    clipping: {
        type: Schema.Types.ObjectId,
        ref: 'Clipping',
        required: true
    },
    frontImage: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    backImage: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    }
})

const Product = mongoose.model('Product', productSchema, 'product')

const Movie = Product.discriminator('Movie', movieSchema)

const Money = Product.discriminator('Money', moneySchema)

module.exports = { Product, Movie, Money };
