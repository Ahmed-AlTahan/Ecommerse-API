const { check } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const slugify  = require('slugify');


exports.getSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Subcategory id format'),
    validatorMiddleware,
];


exports.createSubCategoryValidator = [
    check('name')
    .notEmpty()
    .withMessage('SubCategory name required')
    .isLength({min: 2})
    .withMessage('Too short Subcategory name')
    .isLength({max: 32})
    .withMessage('Too long Subcategory name')
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),

    check('category')
    .notEmpty().withMessage('subCategory must belong to parent category')
    .isMongoId().withMessage('Invalid category id format'),
    
    
    validatorMiddleware,
];


exports.updateSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Subcategory id format'),
    check('name').custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),
    validatorMiddleware,
];


exports.deleteSubCategoryValidator = [
    check('id').isMongoId().withMessage('Invalid Subcategory id format'),
    validatorMiddleware,
];
