const config = require("config");
const { User } = require("../models/user");
const schema = require("../graphql/schema");
const jwt = require("jsonwebtoken");

module.exports = forContextSub;

async function forContextSub(connectionParams) {
  const decoded = jwt.verify(
    connectionParams.Authorization,
    config.get("jwtPrivateKey")
  );
  const user = await User.findOne({
    _id: decoded._id,
    tokens: connectionParams.Authorization,
  });
  if (user) {
    return user;
  }
  return false;
}
