const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("config");
router.get("/:token", async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.params.token, config.get("jwtPrivateKey"));
    console.log(decoded);
    let user = await User.findById(decoded._id);
    if (user) {
      res.status(200).send("Your email has been verified");
      await User.updateOne({ _id: user._id }, { confirm: true});
      await user.save();
    } else {
      res.status(500).send("this token is expirein please go and make new account ");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("server error!!!");
  }
});

module.exports = router;
