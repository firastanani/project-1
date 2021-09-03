const Joi = require("joi");
const mongoose = require("mongoose");
const commentSchema = mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
  },
  { timestamps: true, toObject: { virtuals: true } }
);

commentSchema.statics.validateCreateComment = (comment) => {
  const schema = {
    fileUrl:Joi.any(),
    text: Joi.string().required(),
    postId: Joi.objectId(),
  };

  const { error } = Joi.object(schema).validate(comment);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};

commentSchema.statics.validateUpdateComment = (comment) => {
  const schema = {
    fileUrl:Joi.any(),
    text: Joi.string().required(),
  };

  const { error } = Joi.object(schema).validate(comment);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};


const Comment = mongoose.model("Comment", commentSchema);

exports.Comment = Comment;
