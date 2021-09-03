const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReactionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

const Reaction = mongoose.model("Reaction", ReactionSchema);
module.exports.Reaction = Reaction
