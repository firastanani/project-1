const { Message } = require("../../../models/message");

const {User} = require('../../../models/user')
  module.exports = {  
  Chat: {
    users: async (parent, args, ctx, info) => {
      const users = await User.find({ _id: {$in : parent.users} });
      return users;
    },
    admin: async (parent, args, ctx, info) => {
      const user = await User.findById(parent.admin);
      return user;
    },
    messages: async (parent, args, ctx, info) => {
      const messages = await Message.find({ chat: parent._id });
      return messages;
    },
  },
};
