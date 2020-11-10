const express = require('express')
const router = express.Router()
const DirectorController = require('../controllers/director.controller')
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

router.post('/save-director', verifyAccessToken, upload.fields([{
    name: 'image', maxCount: 1
}]), DirectorController.saveDirector)

router.delete('/delete/:id', verifyAccessToken, DirectorController.deleteDirector)

router.get('/get/:id', DirectorController.getDirectorById)

router.post('/filter', DirectorController.getDirectors)

router.patch('/update-director/:id', verifyAccessToken, upload.fields([{
    name: 'image', maxCount: 1
}]), DirectorController.updateDirector)

module.exports = router