const ProductModel = require('../models/productModel');
const factory = require('./handlersFactory');
const {uploadMixOfImages,} = require("../middlewares/uploadImageMiddleware");

const asyncHandler = require('express-async-handler') ;
const {v4: uuidv4} = require('uuid');
const sharp = require('sharp');



exports.uploadProductImages = uploadMixOfImages([
    {
        name: "imageCover",
        maxCount: 5,
    },
    {
        name: 'images',
        maxCount: 5,

    }
]);


exports.resizeProductImages = asyncHandler(async(req, res, next) => {
    // 1- Image processing for image cover
    if(req.files.imageCover){
        const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

        await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/products/${imageCoverFileName}`);

        // save image into db
        req.body.imageCover = imageCoverFileName;
    }
    // 2- Image processing for images
    if(req.files.images){
        req.body.images = [];
        await Promise.all(
            req.files.images.map(async(img, index) => {    
            const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

            await sharp(img.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`uploads/products/${imageName}`);

            // save image into db
            req.body.images.push(imageName);
            })
        )
    }
    next();
});



// @desc    Get list of products
// @route   GET     /api/v1/products
// access   Public    
exports.getProducts = factory.getAll(ProductModel, 'Products');

// @decs    Get specific product by id
// @route   GET /api/v1/products/:id
// access   Public
exports.getProduct = factory.getOne(ProductModel, 'reviews');

// @desc    Create product
// @route   POST    /api/v1/products
// @access  Private/admin-manager
exports.createProduct = factory.createOne(ProductModel);

// @desc    Update specific product
// @route   PUT    /api/v1/products/:id
// @access  Private/admin-manager
exports.updateProduct = factory.updateOne(ProductModel);


// @desc    Delete specific product
// @route   DELETE    /api/v1/products/:id
// @access  Private/admin
exports.deleteProduct = factory.deleteOne(ProductModel);