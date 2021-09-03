const Chat = require("../../../models/chat");
const {Message} = require("../../../models/message");
const {User} = require('../../../models/user')
const checkAuth = require("../../../middleware/checkAuth");

module.exports = {
  Query: {
    getMessageForPrivate: checkAuth.createResolver(async (parent, {from}, ctx, info) => {
      const otherUser = await User.findOne({ email: from });
      if (!otherUser) throw new Error("User not found");
      const userEmails = [ctx.req.user._id, otherUser._id];
      const messages = await Message.find().and([{author: { $in: userEmails }}, { receiverMail: { $in: userEmails }}]).
      sort({ createdAt: -1 }).populate("reactions");
      return messages;
    }),
    chats: checkAuth.createResolver(async (parent, args, ctx, info) => {
      const Chats = await Chat.find({})
        .populate("users")
        .populate("admin")
        .populate("messages");
      return Chats;
    }),
    myChats: checkAuth.createResolver(async (parent, args, ctx, info) => {
      const Chats = await Chat.find({ users: ctx.req.user._id })
        .populate("users")
        .populate("admin")
        .populate("messages");
      return Chats;
    }),
    chat: checkAuth.createResolver(async (parent, { id }, ctx, info) => {
      const Chat1 = await Chat.findById(id)
        .populate("users")
        .populate("admin")
        .populate("messages");
      return Chat1;
    }),
  },
};
