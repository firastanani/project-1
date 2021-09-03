const {Message} = require("../../../models/message");

module.exports = {  
  Reaction: {
    message: async (parent, args, ctx, info) => {
      const message = await Message.findById({ _id: parent.message });
      return message;
    },
  },
};
