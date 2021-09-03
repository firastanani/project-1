const checkAuth = require("../../../middleware/checkAuth");
const { deleteFile } = require("../../../util/forUploadFile/fileDelete");
const { processUpload } = require("../../../util/forUploadFile/fileUplad");
const notificationComment = require("../../../util/forNotification/notificationComment");
const validateID = require("../../../util/idValidate");
const Chat = require("../../../models/chat");
const { Message } = require("../../../models/message");
const {Reaction} = require("../../../models/Reaction");
const {User} = require('../../../models/user')
module.exports = {
  Mutation: {
    // userTypingForPrivate: checkAuth.createResolver(async function (
    //   parent,
    //   { email, receiverMail },
    //   ctx,
    //   info
    // ) {
    //   ctx.pubsub.publish("userTyping", {
    //     userTypingForPrivate: email,
    //   });
    //   return true;
    // }),
    createMessageForPrivate: checkAuth.createResolver(async function (
      parent,
      { senderMail, receiverMail, message, fileUrl },
      ctx,
      info
    ) {
      let uploadFile;
      if (fileUrl) {
        uploadFile = await processUpload(fileUrl);

        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        }
      }
      const author2 = await User.findOne({ email: ctx.req.user.email });
      const receiveMail2 = await User.findOne({ email: receiverMail });
     
      fileUrl = uploadFile ? uploadFile.Location : null;
      let messages = new Message({
        chat:null,
        author: author2.id,
        receiverMail : receiveMail2.id,
        content: message,
        fileUrl,
      });
      messages = await messages.save();
      ctx.pubsub.publish("newMessage", {
        newMessageForPrivate: messages,
      });
      return messages;
    }),
    createMessage: checkAuth.createResolver(async function (
      parent,
      { chatId, content, fileUrl },
      ctx,
      info
    ) {
      const pubsub = ctx.pubsub;
      const existingChat = await Chat.findOne({ _id: chatId });
      if (!existingChat) {
        const errors = new Error("Chat deleted !!");
        errors.code = 400;
        throw errors;
      }

      let uploadFile;
      if (fileUrl) {
        uploadFile = await processUpload(fileUrl);

        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        }
      }

      fileUrl = uploadFile ? uploadFile.Location : null;
      let message = new Message({
        chat: chatId,
        author: ctx.req.user._id,
        content: content,
        fileUrl: fileUrl,
      });
      message = await message.save();

      pubsub.publish(`${chatId}`, {
        newEvent: {
          mutation: "Create",
          data: message,
        },
      });

      return message;
    }),

    deleteMessage: checkAuth.createResolver(async function (
      parent,
      { messageId },
      ctx,
      info
    ) {
      const pubsub = ctx.pubsub;
      validateID(messageId);

      let message = await Message.findById(messageId);

      if (!message) {
        const errors = new Error("message not found");
        errors.code = 404;
        throw errors;
      }

      if (!message.author.equals(ctx.req.user._id)) {
        const errors = new Error("can't remove others message");
        errors.code = 401;
        throw errors;
      }

      if (message.fileUrl) deleteFile(message.fileUrl);

      message = await message.remove();

      //   message.author = ctx.req.user;
      pubsub.publish(`${message.chat}`, {
        newEvent: {
          mutation: "delete",
          data: message,
        },
      });
      return message;
    }),
    updateMessage: checkAuth.createResolver(async function (
      parent,
      { messageId, content, fileUrl },
      ctx,
      info
    ) {
      const pubsub = ctx.pubsub;
      validateID(messageId);

      const message = await Message.findOne({
        _id: messageId,
        author: ctx.req.user._id,
      });

      if (!message) {
        const errors = new Error("message not found");
        errors.code = 404;
        throw errors;
      }

      let uploadFile;
      if (fileUrl) {
        uploadFile = await processUpload(fileUrl);
        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        } else {
          if (message.fileUrl) deleteFile(message.fileUrl);
          message.fileUrl = uploadFile.Location;
        }
      }

      message.content = content;
      await message.save();
      pubsub.publish(`${message.chat}`, {
        newEvent: {
          mutation: "update",
          data: message,
        },
      });
      return message;
    }),
    createChat: checkAuth.createResolver(async function (
      parent,
      { name, users },
      ctx,
      info
    ) {
      const newChat = new Chat({
        name,
        users,
        admin: ctx.req.user._id,
      });

      await newChat.save();
      console.log(newChat);
      return newChat;
    }),
    reactToMessage: checkAuth.createResolver(async function (
      parent,
      { messageId, content },
      ctx,
      info
    ) {
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];
      if (!reactions.includes(content)) {
        throw new UserInputError("Invalid reaction");
      }
      const message = await Message.findOne({_id : messageId});
      if (!message) throw new UserInputError("message not found");

      let reaction = await Reaction.findOne({
        message: messageId,
        user: ctx.req.user._id,
      });

      if (reaction) {
        if (reaction.content === content) {
          await reaction.remove();
          ctx.pubsub.publish(`${message.chat}`, {
            newEvent: {
              mutation: "delete Reaction",
              data: message,
              content: content,
            },
          });
          return reaction;
        } else {
          reaction.content = content;
          await reaction.save();
          ctx.pubsub.publish(`${message.chat}`, {
            newEvent: {
              mutation: "update Reaction",
              data: message,
              content: content,
            },
          });
          return reaction;
        }
      } else {
        reaction = new Reaction({
          message: messageId,
          user: ctx.req.user._id,
          content,
        });
        await reaction.save();
      }
      if (message.chat) {
        ctx.pubsub.publish(`${message.chat}`, {
          newEvent: {
            mutation: "create Reaction",
            data: message,
            content: content,
          },
        });
      } else {
        ctx.pubsub.publish(`NEW_REACTION`, { newReactionForPrivate: reaction });
      }

      return reaction;
    }),
  },
};
