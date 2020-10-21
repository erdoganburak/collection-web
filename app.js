const express = require('express')
const morgan = require('morgan')
const createError = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const cors = require('cors');

const authRoute = require('./routes/auth.route')
const emissionRoute = require('./routes/emission.route')
const moneyRoute = require('./routes/money.route')
const clippingRoute = require('./routes/clipping.route')
const productRoute = require('./routes/product.route')
const imageRoute = require('./routes/image.route')

require('./helpers/init_redis')

const app = express()
app.use(morgan('dev'))
app.use(express.json())
const allowedOrigins = ['http://localhost:4200',
    'http://yourapp.com'];
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.urlencoded({ extended: true }))
app.use('/auth', authRoute)
app.use('/clipping', clippingRoute)
app.use('/emission', emissionRoute)
app.use('/money', moneyRoute)
app.use('/product', productRoute)
app.use('/image', imageRoute)

app.use(async (req, res, next) => {
    next(createError.NotFound())
})

app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})