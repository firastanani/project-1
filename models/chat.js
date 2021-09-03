const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);


ChatSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "chat",
});

module.exports = mongoose.model("Chat", ChatSchema);
