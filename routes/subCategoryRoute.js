
const express = require('express');
const {
    createSubCategory,
    getSubCategories,
    getSubCategory,
    updateSubCategory,
    deleteSubCategory,
    setCategoryIdToBody,
    createFilterObject,
} = require('../services/subCategoryService');
const { validationResult, param } = require('express-validator');
const {
    createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator,
} = require('../utils/validators/subCategoryValidator');

const authService = require('../services/authService');

const router = express.Router({mergeParams: true});

router.route('/')
.post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
)
.get(createFilterObject, getSubCategories);

router.route('/:id')
.get(getSubCategoryValidator, getSubCategory)
.put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    updateSubCategoryValidator,
    updateSubCategory
)
.delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteSubCategoryValidator,
    deleteSubCategory
);



module.exports = router;