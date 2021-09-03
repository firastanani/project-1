const {Message} = require("../../../models/message");
const {Reaction} = require("../../../models/Reaction");
const { User } = require("../../../models/user");
const Chat = require("../../../models/chat");

module.exports = {  
  Message: {
    chat: async (parent, args, ctx, info) => {
      const chat = await Chat.findById({ _id: parent.chat });
      return chat;
    },
    author: async (parent, args, ctx, info) => {
      const user = await User.findById({ _id: parent.author });
      return user;
    },
    receiverMail: async (parent, args, ctx, info) => {
      const user = await User.findById({ _id: parent.receiverMail });
      return user;
    },
    reactions: async (parent, args, ctx, info) => {
      const reactions = await Reaction.find({ message: parent._id });
      return reactions;
    },
  },
};
