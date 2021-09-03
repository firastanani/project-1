const { User } = require("../../../models/user");

module.exports = {  
  Notification: {
    from: async (parent, args, ctx, info) => {
      const user = await User.findById({ _id: parent.from });
      return user;
    },
    to: async (parent, args, ctx, info) => {
      const user = await User.findById({ _id: parent.to });
      return user;
    },
  },
};
