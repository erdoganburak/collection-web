const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/category.controller')
const { verifyAccessToken } = require('../helpers/jwt_helper')

router.post('/save-category', verifyAccessToken, CategoryController.saveCategory)

router.delete('/delete/:id', verifyAccessToken, CategoryController.deleteCategory)

router.get('/get/:id', CategoryController.getCategoryById)

router.post('/filter', CategoryController.getCategories)

router.patch('/update-category/:id', verifyAccessToken, CategoryController.updateCategory)

module.exports = router