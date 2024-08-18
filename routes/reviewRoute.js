
const express = require('express');
const {
    getReviews,
    createReview,
    getReview,
    updateReview,
    deleteReview,
    createFilterObject,
    setProductIdAndUserIdToBody,
} = require('../services/reviewService');
const { validationResult, param } = require('express-validator');

const {
    getReviewValidator,
    updateReviewValidator, 
    deleteReviewValidator, 
    createReviewValidator
} = require('../utils/validators/reviewValidator');


const authService = require('../services/authService');

const router = express.Router({mergeParams: true});

router.route('/')
.get(createFilterObject, getReviews)
.post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
);

router
.route('/:id')
.get(getReviewValidator, getReview)
.put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
)
.delete(
    authService.protect,
    authService.allowedTo('admin', 'user', 'manager'),
    deleteReviewValidator,
    deleteReview
);

module.exports = router;