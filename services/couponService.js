const CouponModel = require('../models/couponModel');
const factory = require('./handlersFactory');

// @desc    Get list of coupons
// @route   GET     /api/v1/coupons
// access   Private/admin-manager    
exports.getCoupons = factory.getAll(CouponModel);

// @decs    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// access   Private/admin-manager
exports.getCoupon = factory.getOne(CouponModel);

// @desc    Create coupon
// @route   POST    /api/v1/coupons
// @access  Private/admin-manager
exports.createCoupon = factory.createOne(CouponModel);

// @desc    Update specific coupon
// @route   PUT    /api/v1/coupons/:id
// @access  Private/admin-manager
exports.updateCoupon = factory.updateOne(CouponModel);

// @desc    Delete specific coupon
// @route   DELETE    /api/v1/coupons/:id
// @access  Private/admin-manager
exports.deleteCoupon = factory.deleteOne(CouponModel);