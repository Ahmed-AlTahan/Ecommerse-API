const { check, body } = require('express-validator');
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const slugify  = require('slugify');
const User = require('../../models/userModel');
const bcrypt = require('bcryptjs');

exports.createUserValidator = [
    check('name')
    .notEmpty()
    .withMessage('User required')
    .isLength({min: 3})
    .withMessage('Too short User name')
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),

    check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('invalid email address')
    .custom((val) =>
        User.findOne({email: val}).then((user) =>{
            if(user){
                return Promise.reject(new Error('Email is already in use'));
            }
        })
    ),

    check('password')
    .notEmpty()
    .withMessage('Password required')
    .isLength({min:6})
    .withMessage('password must be at least 6 characters')
    .custom((password, {req}) => {
        if(password != req.body.passwordConfirm){
            throw new Error('Password Confirmation incorrect');
        }
        return true;
    }),

    check('passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation required'),

    check('phone')
    .isMobilePhone('ar-SY')
    .withMessage('invalid phone number')
    .optional(),



    check('profileImg').optional(),
    check('role').optional(),

    validatorMiddleware,
];

exports.getUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware,
];

exports.updateUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    body('name')
    .optional()
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('email')
    .optional()
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('invalid email address')
    .custom((val) =>
        User.findOne({email: val}).then((user) =>{
            if(user){
                return Promise.reject(new Error('Email is already in use'));
            }
        })
    ),
    check('phone')
    .isMobilePhone('ar-SY')
    .withMessage('invalid phone number')
    .optional(),

    check('profileImg').optional(),
    check('role').optional(),

    validatorMiddleware,
];


exports.changeUserPasswordValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),

    body('currentPassword')
    .notEmpty()
    .withMessage('currentPassword required'),

    body('passwordConfirm')
    .notEmpty()
    .withMessage('passwordConfirm required'),

    body('password')
    .notEmpty()
    .withMessage('password required')
    .custom(async(val, {req}) => {
        // 1) verify current password
        const user = await User.findById(req.params.id);
        if(!user){
            throw new Error('there is no user for this id');
        }
        const isCorrectPassword = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );
        if(!isCorrectPassword) {
            throw new Error('Incorrect current password');  
        }

        // 2) verify password confirmation
        if(val != req.body.passwordConfirm){
            throw new Error('Password Confirmation incorrect');
        }

        return true;
    }),


    validatorMiddleware,
];

exports.deleteUserValidator = [
    check('id').isMongoId().withMessage('Invalid User id format'),
    validatorMiddleware,
];

exports.updateLoggedUserValidator = [
    body('name')
    .optional()
    .custom((val, {req}) => {
        req.body.slug = slugify(val);
        return true;
    }),
    check('email')
    .optional()
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('invalid email address')
    .custom((val) =>
        User.findOne({email: val}).then((user) =>{
            if(user){
                return Promise.reject(new Error('Email is already in use'));
            }
        })
    ),
    check('phone')
    .isMobilePhone('ar-SY')
    .withMessage('invalid phone number')
    .optional(),

    validatorMiddleware,
];