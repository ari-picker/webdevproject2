var express = require('express');
var router = express.Router();
const { getCollection } = require('../models/db');

router.get('/', function(req, res, next) {
  res.redirect("/signup");
});

router.get('/signin', function(req, res, next) {
  res.render("signin");
});

router.get('/signup', function(req, res, next) {
  res.render("signup");
});

router.get('/dashboard', async function(req, res, next) {
  let name = req.cookies.userName;
  if (!name) {
    res.redirect("/signin");
    return;
  }
  let history = [];
  try {
    let conn = getCollection("quiz_history");
    history = await conn.find({ userEmail: req.cookies.userEmail })
      .sort({ timestamp: -1 }).limit(10).toArray();
  } catch(e) {
    console.error(e);
  }
  res.render("dashboard", { name: name, quiz: null, result: null, error: null, history: history });
});

router.get('/users/logout', function(req, res, next) {
  res.clearCookie("userName");
  res.clearCookie("userEmail");
  res.redirect("/signin");
});

module.exports = router;
