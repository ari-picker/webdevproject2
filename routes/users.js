var express = require('express');
var router = express.Router();
const { getCollection } = require('../models/db');
const crypto = require("crypto");

router.post("/signup/submit", async (req, res) => {
  try {
    let conn = getCollection("users");
    let password = req.body.password;
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

router.post("/signin/submit", async (req, res) => {
  try {
    let conn = getCollection("users");
    let email = req.body.email;
    let password = req.body.password;
    let dbuser = await conn.findOne({email: email});
    if (!dbuser) {
      res.redirect("/signin");
      return;
    }
    const keyLength = 11;
    const salt = dbuser.salt;
    let cryptoPassword = crypto.scryptSync(password, salt, keyLength);
    if (cryptoPassword.toString("hex") === dbuser.password) {
      res.cookie("userName", dbuser.name);
      res.cookie("userEmail", dbuser.email);
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
