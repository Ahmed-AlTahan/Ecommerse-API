const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require('../../models/reviewModel');



exports.createReviewValidator = [
    check('title').optional(),

    check('ratings')
    .notEmpty().withMessage('rating is required')
    .isFloat({min1: 1, max1:5}).withMessage('rating is between 1 and 5'),

    check('user').isMongoId().withMessage('Invalid Review id format'),

    check('product').isMongoId().withMessage('Invalid Review id format')
    .custom((val, {req}) => {
        // Check if logged user creates review before
        return Review.findOne({user: req.user._id, product: req.body.product}).then((review) => {
            if(review){
                return Promise.reject(new Error('Review already exists'));
            }
        });
    }),


    validatorMiddleware,
];

exports.getReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format'),
    validatorMiddleware,
];

exports.updateReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format')
    .custom((val, {req}) => {
        // Check review ownership before updating
        return Review.findById(val).then((review) => {
            if(!review){
                return Promise.reject(new Error('There is no review for this id'));
            }
            if(review.user._id.toString() != req.user._id.toString()){
                return Promise.reject(new Error('You are not allowed to perform this action'));
            }
        });
    }),
    validatorMiddleware,
];


exports.deleteReviewValidator = [
    check('id').isMongoId().withMessage('Invalid Review id format')
    .custom((val, {req}) => {
        // Check review ownership before updating
        if(req.user.role == 'user'){
            return Review.findById(val).then((review) => {
                if(!review){
                    return Promise.reject(new Error('There is no review for this id'));
                }
                if(review.user._id.toString() != req.user._id.toString()){
                    return Promise.reject(new Error('You are not allowed to perform this action'));
                }
            });
        }
        return true;
    }),
    validatorMiddleware,
];
