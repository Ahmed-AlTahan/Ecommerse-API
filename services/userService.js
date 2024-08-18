const User = require('../models/userModel');
const factory = require('./handlersFactory');
const {uploadSingleImage} = require('../middlewares/uploadImageMiddleware');
const asyncHandler = require('express-async-handler') ;
const {v4: uuidv4} = require('uuid');
const sharp = require('sharp');

const apiError = require('../utils/apiError');
const bcrypt = require('bcryptjs');
const createToken = require('../utils/createToken');



// upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// image processing 
exports.resizeImage = asyncHandler(async(req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    if(req.file){
        await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`uploads/users/${filename}`);

        // save image into db
        req.body.profileImg = filename;
    }
    next();
});


// @desc    Get list of users
// @route   GET     /api/v1/users
// access   Private/admin    
exports.getUsers = factory.getAll(User);

// @decs    Get specific user by id
// @route   GET /api/v1/users/:id
// access   Private/admin
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST    /api/v1/users
// @access  Private/admin
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT    /api/v1/users/:id
// @access  Private/admin
exports.updateUser = asyncHandler(async(req, res, next) => {
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            slug: req.body.slug,
            phone: req.body.phone,
            email: req.body.email,
            profileImg: req.body.profileImg,
            role: req.body.role,
        },
        {new: true});

    if(!document){
        return next(new apiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({data: document});
});

exports.changeUserPassword = asyncHandler(async(req, res, next) => {
    const document = await User.findByIdAndUpdate(
        req.params.id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {new: true});

    if(!document){
        return next(new apiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({data: document});
});

// @desc    Delete specific user
// @route   DELETE    /api/v1/users/:id
// @access  Private/admin
exports.deleteUser = factory.deleteOne(User);


// @decs    Get logged user data
// @route   GET /api/v1/users/getMe
// access   Private/protect
exports.getLoggedUserData = asyncHandler(async(req, res, next) => {
    req.params.id = req.user._id;
    next();
});


// @decs    Update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// access   Private/protect
exports.updateLoggedUserPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {new: true}
    );

    const token = createToken(user._id);
    res.status(200).json({data: user, token}); 
});

// @decs    Update logged user data (without role, password)
// @route   PUT /api/v1/users/updateMe
// access   Private/protect
exports.updateLoggedUserData = asyncHandler(async(req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        },
        {new: true}
    );

    res.status(200).json({data: updatedUser});
});


// @decs    Delete logged user 
// @route   DELETE /api/v1/users/deleteMe
// access   Private/protect
exports.deleteLoggedUser = asyncHandler(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {active: false});

    res.status(204).json({status: "Success"});
});