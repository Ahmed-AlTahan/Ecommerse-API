const express = require('express');

const {
    getCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryImage,
    resizeImage
} = require('../services/categoryService');
const {
    getCategoryValidator,
    updateCategoryValidator,
    deleteCategoryValidator,
    createCategoryValidator
} = require('../utils/validators/categoryValidator');

const authService = require('../services/authService');

const subCategoryRoute = require('./subCategoryRoute');


const router = express.Router();

router.use('/:categoryId/subcategories', subCategoryRoute);

router
.route('/')
.get(getCategories)
.post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
);

router
.route('/:id')
.get(getCategoryValidator,getCategory)
.put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidator,
    updateCategory
)
.delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteCategoryValidator,
    deleteCategory
);

module.exports = router;