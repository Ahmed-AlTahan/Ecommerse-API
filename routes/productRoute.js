
const express = require('express');
const {
    getProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    resizeProductImages,
} = require('../services/productService');
const { validationResult, param } = require('express-validator');
const {
    getProductValidator,
    updateProductValidator,
    deleteProductValidator,
    createProductValidator,
} = require('../utils/validators/productValidator');

const authService = require('../services/authService');
const reviewRoute = require('./reviewRoute');

const router = express.Router();

router.use('/:productId/reviews', reviewRoute);

router.route('/')
.get(getProducts)
.post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
);

router.route('/:id')
.get(getProductValidator,getProduct)
.put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
)
.delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteProductValidator,
    deleteProduct
);

module.exports = router;