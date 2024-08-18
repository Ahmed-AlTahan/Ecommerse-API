
const express = require('express');
const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    changeUserPassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUser,
} = require('../services/userService');
const { validationResult, param } = require('express-validator');
const {
    getUserValidator,
    updateUserValidator, 
    deleteUserValidator, 
    createUserValidator,
    changeUserPasswordValidator,
    updateLoggedUserValidator,
} = require('../utils/validators/userValidator');

const authService = require('../services/authService');


const router = express.Router();


router.use(authService.protect)

router.get('/getMe', getLoggedUserData, getUser);
router.put('/changeMyPassword', updateLoggedUserPassword);
router.put('/updateMe', updateLoggedUserValidator, updateLoggedUserData);
router.delete('/deleteMe', deleteLoggedUser);




// Admin 

router.use(authService.allowedTo('admin', 'manager'));

router
.put('/changePassword/:id', changeUserPasswordValidator, changeUserPassword);

router.route('/')
.get(getUsers)
.post(
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
);

router
.route('/:id')
.get(
    getUserValidator,
    getUser
)
.put(
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
)
.delete(
    deleteUserValidator,
    deleteUser
);

module.exports = router;