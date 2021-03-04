const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./custom_middleware/error-handler');
const connectDB = require('./config/db');

const app = express();

//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to database
connectDB();

//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.Node_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// CORS settings
// app.use(function(req, res, next){
//     res.setHeader("Access-Control-Allow-Origin", "*"); // temporary
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Expose-Headers", "Content-Length");
//     res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//     res.setHeader("Access-Control-Allow-Headers",
//     "Origin,Authorization,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method");
//   next();
// });


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));



//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,
    console.log(`Server running in ${process.env.Node_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejection
//The global error handling was setup to handle error connection to DB.
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});