const express = require('express')
const router = express.Router()
const ActorController = require('../controllers/actor.controller')
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

router.post('/save-actor', verifyAccessToken, upload.fields([{
    name: 'image', maxCount: 1
}]), ActorController.saveActor)

router.delete('/delete/:id', verifyAccessToken, ActorController.deleteActor)

router.get('/get/:id', ActorController.getActorById)

router.post('/filter', ActorController.getActors)

router.patch('/update-actor/:id', verifyAccessToken, upload.fields([{
    name: 'image', maxCount: 1
}]), ActorController.updateActor)

module.exports = router