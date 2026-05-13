// Create a router — like FastAPI's APIRouter, groups related routes in one file
var express = require('express');
var router = express.Router();
// Import the DB helper to fetch quiz history from MongoDB
const { getCollection } = require('../models/db');

// Visiting / redirects to dashboard if logged in, otherwise to signup
router.get('/', function(req, res, next) {
  if (req.signedCookies.userName) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/signup");
  }
});

// GET /signin — redirect to dashboard if already logged in
router.get('/signin', function(req, res, next) {
  if (req.signedCookies.userName) {
    res.redirect("/dashboard");
    return;
  }
  res.render("signin", { error: req.query.error || null });
});

// GET /signup — redirect to dashboard if already logged in
router.get('/signup', function(req, res, next) {
  if (req.signedCookies.userName) {
    res.redirect("/dashboard");
    return;
  }
  res.render("signup", { error: req.query.error || null });
});

// GET /dashboard — main page, requires the user to be logged in (cookie check)
router.get('/dashboard', async function(req, res, next) {
  let name = req.signedCookies.userName;
  if (!name) {
    res.redirect("/signin");
    return;
  }
  // Fetch the user's last 10 quiz attempts from MongoDB, newest first
  let history = [];
  try {
    let conn = getCollection("quiz_history");
    history = await conn.find({ userEmail: req.signedCookies.userEmail })
      .sort({ timestamp: -1 }).limit(10).toArray();
  } catch(e) {
    console.error(e);
  }
  // Render the dashboard, passing user data + history (quiz and result are null on first load)
  res.render("dashboard", { name: name, quiz: null, result: null, error: null, history: history });
});

// GET /users/logout — clear the login cookies and redirect to sign-in page
router.get('/users/logout', function(req, res, next) {
  res.clearCookie("userName");
  res.clearCookie("userEmail");
  res.redirect("/signin");
});

module.exports = router;
