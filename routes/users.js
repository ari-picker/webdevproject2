// Import Express, database helper, and crypto for password hashing
var express = require('express');
var router = express.Router();
const { getCollection } = require('../models/db');
const crypto = require("crypto");

// POST /users/signup/submit — create a new user account
router.post("/signup/submit", async (req, res) => {
  try {
    let conn = getCollection("users");
    let password = req.body.password;
    // Generate a random salt and hash the password with scrypt (key stretching)
    const salt = crypto.randomBytes(11).toString("hex");
    const keyLength = 11;
    let cryptoPassword = crypto.scryptSync(password, salt, keyLength).toString("hex");
    let newUser = {
      name: req.body.name,
      email: req.body.email,
      password: cryptoPassword,
      salt: salt
    };
    await conn.insertOne(newUser);
    res.redirect("/signin");
  } catch(e) {
    console.error(e);
    res.redirect("/signup");
  }
});

// POST /users/signin/submit — validate credentials and set signed cookies
router.post("/signin/submit", async (req, res) => {
  try {
    let conn = getCollection("users");
    let email = req.body.email;
    let password = req.body.password;
    // Look up the user by email
    let dbuser = await conn.findOne({email: email});
    if (!dbuser) {
      res.redirect("/signin");
      return;
    }
    // Re-hash the provided password with the stored salt and compare
    const keyLength = 11;
    const salt = dbuser.salt;
    let cryptoPassword = crypto.scryptSync(password, salt, keyLength);
    if (cryptoPassword.toString("hex") === dbuser.password) {
      // Set signed cookies — signing prevents tampering
      // If someone tries to edit the cookie, req.signedCookies returns undefined
      res.cookie("userName", dbuser.name, { signed: true });
      res.cookie("userEmail", dbuser.email, { signed: true });
      res.render("dashboard", { name: dbuser.name, quiz: null, result: null, error: null });
    } else {
      res.redirect("/signin");
    }
  } catch(e) {
    console.error(e);
    res.redirect("/signin");
  }
});

module.exports = router;
