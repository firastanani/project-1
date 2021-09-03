const User = require('../../models/user');
const jwt = require('jsonwebtoken')
const config = require('config')
module.exports =  function createUrlConfirmEmail(userID , baseUrl) {
    const token = jwt.sign({ _id: userID }, config.get("jwtPrivateKey") , {expiresIn : "86400s"});

    return `${baseUrl}/confirmation/${token}`;
}