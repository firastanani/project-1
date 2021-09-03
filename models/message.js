const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverMail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

MessageSchema.virtual("reactions", {
  ref: "Reaction",
  localField: "_id",
  foreignField: "message",
});

const Message = mongoose.model("Message", MessageSchema);
exports.Message = Message;
