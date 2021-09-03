const { User } = require("../../../models/user");

module.exports = {
  Query: {
    login: async function (parent, { data }, ctx, info) {
      console.log(data)
      User.validateLogin(data);

      let user = await User.findByCredentials(data.email, data.password);

      const token = user.generateAuthToken();

      return { token: token, user: user };
    },
  },
};
