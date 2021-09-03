const mongoose = require("mongoose");

const schemaNotification = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
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
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

const Notification = mongoose.model("Notification", schemaNotification);

exports.Notification = Notification;
