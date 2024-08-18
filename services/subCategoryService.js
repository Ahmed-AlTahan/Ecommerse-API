const subCategoryModel = require('../models/subCategoryModel');
const factory = require('./handlersFactory');

exports.setCategoryIdToBody = (req, res, next) => {
    // Nested route
    if(!req.body.category) req.body.category = req.params.categoryId;
    next();
};

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObject = (req, res, next) => {
    let filterObject = {};
    if(req.params.categoryId) filterObject = {category: req.params.categoryId};
    req.filterObject = filterObject;
    next();
};

// @desc    Get list of subcategories
// @route   GET     /api/v1/subcategories
// access   Public    
exports.getSubCategories = factory.getAll(subCategoryModel);


// @decs    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// access   Public
exports.getSubCategory = factory.getOne(subCategoryModel);


// @desc    Create Subcategory
// @route   POST    /api/v1/subcategories
// @access  Private/admin-manager
exports.createSubCategory = factory.createOne(subCategoryModel);


// @desc    Update specific subcategory
// @route   PUT    /api/v1/subcategories/:id
// @access  Private/admin-manager
exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @desc    Delete specific subcategory
// @route   DELETE    /api/v1/subcategories/:id
// @access  Private/admin
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);