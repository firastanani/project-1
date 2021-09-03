const Chat = require("../../../models/chat");
const validateID = require("../../../util/idValidate");
const {Message} = require("../../../models/message");
const { withFilter } = require("apollo-server-express");
const {User} = require('../../../models/user')
module.exports = {
  Subscription: {
    newEvent: {
      subscribe: function (parent, { chatId }, { pubsub }, info) {
        validateID(chatId);
        const chat = Chat.findById(chatId);
        if (!chat) {
          const error = new Error("not found chat");
          error.code = 401;
          throw error;
        }

        return pubsub.asyncIterator(`${chatId}`);
      },
    },
    newMessageForPrivate: {
      subscribe: withFilter(
        (parent, args, ctx) => ctx.pubsub.asyncIterator("newMessage"),
        async (payload, __, { user }) => {
         console.log("dfasd");
          let authorEmail = await User.findById(payload.newMessageForPrivate.author)
          let receiverMailEmail = await User.findById(payload.newMessageForPrivate.receiverMail)

          if (
            authorEmail.email == user.email ||
            receiverMailEmail.email == user.email
          ) {
            return true;
          }
          return false;
        }
      ),
    },
    // userTypingForPrivate: {
    //   subscribe: withFilter(
    //     (parent, args ,ctx) => ctx.pubsub.asyncIterator("userTyping"),
    //      (payload, __, { user }) => {
    //       if (
    //         payload.userTypingForPrivate === user.email ||
    //         payload.userTypingForPrivate === user.email
    //       ) {
    //         return true;
    //       }
    //       return false;
    //     }
    //   ),
    // },
    newReactionForPrivate: {
      subscribe: withFilter(
        (parent, args, ctx) => ctx.pubsub.asyncIterator("NEW_REACTION"),
        async (payload, __, { user }) => {
          const message = await Message.findOne({_id : payload.newReactionForPrivate.message});
          console.log(message)
          let authorEmail = await User.findById(message.author)
          let receiverMailEmail = await User.findById(message.receiverMail)
          if (authorEmail.email === user.email || receiverMailEmail.email === user.email) {
            return true;
          }
          return false;
        }
      ),
    },
  },
};
