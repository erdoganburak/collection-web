const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/product.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')
const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 1000000 // 1mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg)$/)) {
            return cb(new Error('Wrong file format'))
        }
        cb(undefined, true)
    }
})

//router.post('/save', verifyAccessToken, upload.array('image', 2), ProductController.saveProduct)

router.post('/save-movie', verifyAccessToken, upload.fields([{
    name: 'frontImage', maxCount: 1
}]), ProductController.saveMovie)

router.post('/save-money', verifyAccessToken, upload.fields([{
    name: 'frontImage', maxCount: 1
}, {
    name: 'backImage', maxCount: 1
}]), ProductController.saveMoney)

router.delete('/delete/:id', verifyAccessToken, ProductController.deleteProduct)

router.get('/get/:id', ProductController.getProductById)

router.get('/get-money/:id', ProductController.getMoneyById)

router.post('/filter', ProductController.getProducts)

router.patch('/update-money/:id', verifyAccessToken, upload.fields([{
    name: 'frontImage', maxCount: 1
}, {
    name: 'backImage', maxCount: 1
}]), ProductController.updateMoney)


router.get('/get-movies-by-director/:id', ProductController.getMoviesByDirectorId)

module.exports = router