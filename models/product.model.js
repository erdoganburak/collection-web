const mongoose = require('mongoose');
const { discriminator } = require('./money.model');
const Schema = mongoose.Schema;

const formats = {
    VCD: 0,
    DVD: 1,
    BLURAY: 2,
    BLURAY4K: 3
}

const productStatus = {
    All: 0,
    Active: 1,
    Passive: 2
}

const productSchema = new Schema({
    name: {
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
    status: {
        type: Number,
        required: true,
        validate(value) {
            if (value === 0 || value > 2) {
                throw new Error('Invalid status')
            }
        }
    },
    stock: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Stock must be zero or a positive number')
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
    actors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Actor',
            required: true
        },
    ],
    directors: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Director',
            required: true
        },
    ],
    categories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
    ],
    frontImage: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    format: {
        type: Number,
        required: true,
        validate(value) {

        }
    },
    year: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Year must be a positive number')
            }
        }
    },
})

const moneySchema = new Schema({
    productNo: {
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
