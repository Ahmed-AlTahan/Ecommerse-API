const apiError = require('../utils/apiError');


const globalError = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV == 'development'){
        sendErrorForDev(err, res);
    }
    else{
        if(err.name == 'JsonWebTokenError') err = handleJwtInvalidSignature();
        if(err.name == 'TokenExpiredError') err = handleJwtExpired();
        
        sendErrorForProd(err, res);
    }
};

const handleJwtInvalidSignature = () => {
    return new apiError('Invalid token, please login again', 401);
}

const handleJwtExpired = () => {
    return new apiError('token expired , please login again', 401);
}

const sendErrorForDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    }); 
}

const sendErrorForProd = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    }); 
}

module.exports = globalError;