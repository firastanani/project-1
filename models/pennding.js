const mongoose = require("mongoose");

const schemaPennding = mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Pennding = mongoose.model("Pennding", schemaPennding);

exports.Pennding = Pennding;
