
const express = require('express');
const {
    signup,
    login,
    forgetPassword,
    verifyPasswordResetCode,
    resetPassword,
} = require('../services/authService');
const { validationResult, param } = require('express-validator');
const {
    signupValidator,
    loginValidator,
} = require('../utils/validators/authValidator');

const router = express.Router();


router.route('/signup')
.post(signupValidator, signup);

router.route('/login')
.post(loginValidator, login);

router.route('/forgetPassword')
.post(forgetPassword);

router.route('/verifyResetCode')
.post(verifyPasswordResetCode);

router.route('/resetPassword')
.put(resetPassword);



module.exports = router;