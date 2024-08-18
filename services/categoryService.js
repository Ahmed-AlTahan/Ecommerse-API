const CategoryModel = require('../models/categoryModel');
const factory = require('./handlersFactory');
const {v4: uuidv4} = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler') ;
const {uploadSingleImage} = require('../middlewares/uploadImageMiddleware');

// upload single image
exports.uploadCategoryImage = uploadSingleImage('image');

// image processing 
exports.resizeImage = asyncHandler(async(req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

    if(req.file){
        await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/categories/${filename}`);
    
        // save image into db
        req.body.image = filename;
    }

    next();
});



// @desc    Get list of categories
// @route   GET     /api/v1/categories
// access   Public    
exports.getCategories = factory.getAll(CategoryModel);

// @decs    Get specific category by id
// @route   GET /api/v1/categories/:id
// access   Public
exports.getCategory = factory.getOne(CategoryModel);

// @desc    Create category
// @route   POST    /api/v1/categories
// @access  Private/admin-manager
exports.createCategory = factory.createOne(CategoryModel);

// @desc    Update specific category
// @route   PUT    /api/v1/categories/:id
// @access  Private/admin-manager
exports.updateCategory = factory.updateOne(CategoryModel);


// @desc    Delete specific category
// @route   DELETE    /api/v1/categories/:id
// @access  Private/admin
exports.deleteCategory = factory.deleteOne(CategoryModel);