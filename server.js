const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

dotenv.config({path:'config.env'});
const dbConnection = require('./config/database');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

const mountRoutes = require('./routes');


// connect with db
dbConnection();

// Express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options('*', cors());

// Compress all responses
app.use(compression());

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
    console.log(`mode : ${process.env.NODE_ENV}`);
}

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