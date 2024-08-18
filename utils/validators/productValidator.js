const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const categoryModel = require('../../models/categoryModel');
const subCategoryModel = require('../../models/subCategoryModel');
const slugify = require('slugify')



exports.createProductValidator = [
    check('title')
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({min: 3})
    .withMessage('Too short Product name')
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),

    check('description')
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({max: 2000})
    .withMessage('Too long Product description'),

    check('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .isNumeric()
    .withMessage('quantity must be a number'),

    check('sold')
    .optional()
    .isNumeric()
    .withMessage('quantity must be a number'),

    check('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isNumeric()
    .withMessage('price must be a number')
    .isLength({max: 32})
    .withMessage('Too long Product price'),

    check('priceAfterDiscount')
    .optional()
    .toFloat()
    .isNumeric()
    .withMessage('priceAfterDiscount must be a number')
    .custom((value, {req}) => {
        if(req.body.price <= value){
            throw new Error('priceAfterDiscount must be lower than price');
        }
        return true;
    }),

    check('colors')
    .optional()
    .isArray()
    .withMessage('colors must be array'),

    check('imageCover')
    .notEmpty()
    .withMessage('imageCover is required'),

    check('images')
    .optional()
    .isArray()
    .withMessage('images must be array'),

    check('category')
    .notEmpty().withMessage('Product must belong to parent category')
    .isMongoId().withMessage('Invalid id format')
    .custom((categoryId) =>
        categoryModel.findById(categoryId)
        .then((category) => {
            if(!category){
                return Promise.reject(new Error('No category for this id'));
            }
        })
    ),


    check('subcategories')
    .optional()
    .isMongoId().withMessage('Invalid id format')
    .custom((subCategoryIds) =>
        subCategoryModel.find({_id: {$exists: true, $in: subCategoryIds}})
        .then((result) => {
            if(result.length != subCategoryIds.length) {
                return Promise.reject(new Error('No subcategory for this id'));
            }
        })
    )
    .custom((val, {req}) =>
        subCategoryModel.find({category: req.body.category}).then(
            (subcategories) => {
                const subcategoriesIdsInDB = [];
                subcategories.forEach(subCategory => {
                    subcategoriesIdsInDB.push(subCategory._id.toString());
                });

                const checker = (target, arr) => target.every((v) => arr.includes(v));
                if(!checker(val, subcategoriesIdsInDB)){
                    return Promise.reject(new Error('subcategories not belong to category'));
                }
            }
            
        )
    ),
    
    check('brand')
    .optional()
    .isMongoId().withMessage('Invalid id format'),

    check('ratingAverage')
    .optional()
    .isNumeric()
    .withMessage('Rating average must be a number')
    .isLength({min: 1})
    .withMessage('Rating average must be above or equal to 1')
    .isLength({min: 5})
    .withMessage('Rating average must be below or equal to 5'),

    check('ratingQuality')
    .optional()
    .isNumeric()
    .withMessage('Rating quality must be a number'),

    validatorMiddleware,
];

exports.getProductValidator = [
    check('id').isMongoId().withMessage('Invalid Product id format'),
    validatorMiddleware,
];


exports.updateProductValidator = [
    check('id').isMongoId().withMessage('Invalid Product id format'),
    body('title')
    .optional()
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),
    validatorMiddleware,
];


exports.deleteProductValidator = [
    check('id').isMongoId().withMessage('Invalid Product id format'),
    validatorMiddleware,
];
