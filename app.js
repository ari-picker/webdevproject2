var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config();
const { connectToDB } = require('./models/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizRouter = require('./routes/quiz');

var app = express();

(async () => {
  try {
    await connectToDB();
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to start database:', error);
  }
})();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
    next();
    return;
  }
  if (!req.headers['cf-access-authenticated-user-email']) {
    res.status(403).send("Access denied. Use Cloudflare Access to reach this site.");
    return;
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quiz', quizRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
