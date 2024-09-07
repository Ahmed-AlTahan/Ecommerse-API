const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

dotenv.config({path:'config.env'});
const dbConnection = require('./config/database');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

const mountRoutes = require('./routes');
const {webhookCheckout} = require('./services/orderService');


// connect with db
dbConnection();

// Express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options('*', cors());

// Compress all responses
app.use(compression());

// checkout webhook
app.post('/webhook-checkout', express.raw({type: 'application/json'}), webhookCheckout);



// Middlewares
app.use(express.json({limit: '20kb'})); // limit variable is for controlling request body size
app.use(express.static(path.join(__dirname, 'uploads')));

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
    console.log(`mode : ${process.env.NODE_ENV}`);
}

// middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
app.use(mongoSanitize());

// Protecting application from brute forcing attack
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per window 
    message: "Too many requests, please try again after 15 minutes",
});

// Apply the rate limiting middleware to all requests
app.use('/api', limiter);


// middleware to protect against HTTP Parameter Pollution attacks
app.use(
    hpp({
        whitelist: [
            'price',
            'sold',
            'quantity',
            'ratingsAverage',
            'ratingsQuantity',
        ]
    })
);


// Mount Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
    // Create error and send it to error handling middleware
    
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);


const PORT = process.env.PORT || 8000 ;
const server = app.listen(PORT , () => {
    console.log(`app running on port : ${PORT}`) ;
});

// Handle rejections outside express
process.on("unhandledRejection" , (err) => {
    console.error(`unhandledRejection Errors : ${err.name} | ${err.message}`);
    server.close(() => {
        console.error("Shutting down....");
        process.exit(1);
    });
});