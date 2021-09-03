const jwt = require("jsonwebtoken");
const {User} = require("../models/user");
const config = require('config');

const setAuth = async (req, res, next)  => {

  try {
    const token = req.header("Authorization");
        
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    
    const user = await User.findOne({
      _id: decoded._id,
      "tokens": token,
    });

    if (!user) {
     req.isAuth = false;
     return next();
    }

    req.user = user;
    req.isAuth = true;
    req.token = token;
    return next();

  } catch (e) {
    req.isAuth = false;
    return next();
  }

};
module.exports = setAuth;