const mongoose = require("mongoose");

const schemaRequests = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Requests = mongoose.model("Requests", schemaRequests);

exports.Requests = Requests;