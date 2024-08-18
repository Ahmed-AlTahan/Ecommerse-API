const crypto = require('crypto');
const asyncHandler = require('express-async-handler') ;
const apiError = require('../utils/apiError');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');
const jwt = require("jsonwebtoken");





// @desc    Signup
// @route   Post     /api/v1/auth/signup
// access   Public   
exports.signup = asyncHandler(async(req, res, next) => {
    // 1) Create a new user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    // 2) Generate token
    const token = createToken(user._id)

    res.status(201).json({data: user, token});
});

// @desc    Login
// @route   Post     /api/v1/auth/login
// access   Public   
exports.login = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new apiError('Incorrect email or password', 401));
    }

    const token = createToken(user._id)

    res.status(202).json({data: user, token}); 
});

// @desc    make sure the user is logged in
exports.protect = asyncHandler(async(req, res, next) => {
    // 1) Check if token exists, if exists hold it
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new apiError('you are not logged in', 401));
    }

    // 2) verify token (no change happens, expired token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3) check if user exists
    const user = await User.findById(decoded.userId);
    if(!user){
        return next(new apiError('this user no longer exists', 401));
    }

    // 4) check if user change his password after token created
    if(user.passwordChangedAt){
        const passwordChangedTimestamp = parseInt(
            user.passwordChangedAt.getTime()/1000, 10
        );

        if(passwordChangedTimestamp > decoded.iat){
            return next(
                new apiError('user recently changed his password, log in again', 401)
            );
        }
    }

    req.user = user;
    next();
});

// @desc    Authorization (User Permissions)
exports.allowedTo = (...roles) => 
    asyncHandler(async(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new apiError('you are not allowed to access this route', 403)
            )
        }

        next();
    });


// @desc    Forget Password
// @route   Post     /api/v1/auth/forgetPassword
// access   Public   
exports.forgetPassword = asyncHandler(async(req, res, next) => {
    // 1) Get user by email
    const user =  await User.findOne({email: req.body.email});
    if(!user){
        return next(new apiError('there is no user for this email', 404 ));
    }  
    
    // 2) Generate reset 6 digits code , save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.passwordResetCode = hashedResetCode;
    // Add expiration time for password reset code (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    try{
        await sendEmail({
            email: user.email,
            subject: "Your password reset code (valid for 10 min)",
            message: `Your password reset code is ${resetCode}`,
        });
    }catch(err) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();
        return next(new apiError('There is an error in sending email', 500));
    }

    res
    .status(200)
    .json({status: "Success", message: "Reset code sent to email"});

});

// @desc    Verify Password Reset Code
// @route   Post     /api/v1/auth/verifyResetCode
// access   Public 
exports.verifyPasswordResetCode = asyncHandler(async(req, res, next) => {
    // 1) Get user based on reset code
    const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: {$gt: Date.now()},
    });

    if(!user){
        return next(new apiError('invalid or expired reset code'));
    }

    // 2) Reset code valid
    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({status: "Success"});
});

// @desc    Reset Password
// @route   Post     /api/v1/auth/resetPassword
// access   Public 
exports.resetPassword = asyncHandler(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    
    if(!user){
        return next(new apiError('Thers is no user for this email'), 404);
    }
    if(!user.passwordResetVerified){
        return next(new apiError('Reset code is not verified'), 400);
    }

    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    
    const token = createToken(user._id)

    res.status(200).json({token});
});





