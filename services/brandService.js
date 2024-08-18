const BrandModel = require('../models/brandModel');
const factory = require('./handlersFactory');
const {uploadSingleImage} = require('../middlewares/uploadImageMiddleware');
const asyncHandler = require('express-async-handler') ;
const {v4: uuidv4} = require('uuid');
const sharp = require('sharp');

// upload single image
exports.uploadBrandImage = uploadSingleImage('image');

// image processing 
exports.resizeImage = asyncHandler(async(req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

    if(req.file){
        await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/brands/${filename}`);

        // save image into db
        req.body.image = filename;
    }
    next();
});


// @desc    Get list of brands
// @route   GET     /api/v1/brands
// access   Public    
exports.getBrands = factory.getAll(BrandModel);

// @decs    Get specific brand by id
// @route   GET /api/v1/brands/:id
// access   Public
exports.getBrand = factory.getOne(BrandModel);

// @desc    Create brand
// @route   POST    /api/v1/brands
// @access  Private/admin-manager
exports.createBrand = factory.createOne(BrandModel);

// @desc    Update specific brand
// @route   PUT    /api/v1/brands/:id
// @access  Private/admin-manager
exports.updateBrand = factory.updateOne(BrandModel);

// @desc    Delete specific brand
// @route   DELETE    /api/v1/brands/:id
// @access  Private/admin
exports.deleteBrand = factory.deleteOne(BrandModel);