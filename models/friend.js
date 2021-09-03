const mongoose = require("mongoose");

const schemaFriends = mongoose.Schema(
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

const Friends = mongoose.model("Friends", schemaFriends);

exports.Friends = Friends;
