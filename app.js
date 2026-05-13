// Import dependencies: express (web framework), path (file paths),
// cookieParser (read cookies), morgan (log requests), dotenv (env vars),
// and our MongoDB connection helper
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
const { connectToDB } = require('./models/db');

// Import route files — each handles a different set of URLs
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizRouter = require('./routes/quiz');

// Create the Express application
var app = express();

// Immediately-invoked async function to connect to MongoDB on startup
// The IIFE pattern lets us use await at the top level of the file
(async () => {
  try {
    await connectToDB();
    console.log('Database initialized');
  } catch (error) {
    // Log the error but don't crash — the app can still start
    console.error('Failed to start database:', error);
  }
})();

// Configure EJS as the template engine — views live in the /views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware stack — every request passes through these in order
app.use(logger('dev'));                 // Log requests to the console
app.use(express.json());                // Parse JSON request bodies into req.body
app.use(express.urlencoded({ extended: false })); // Parse form data into req.body
app.use(cookieParser(process.env.SESSION_SECRET)); // Parse signed cookies — tampering with a cookie will make it show as undefined
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public

// Mount route files at URL prefixes — e.g. /users/signin goes to usersRouter
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quiz', quizRouter);

// 404 handler — if no route matched, create a 404 error and forward it
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler — renders the error page
// In development mode, show the full stack trace; in production just the status
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Export the app so bin/www can start the server
module.exports = app;
