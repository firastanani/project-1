const Joi = require("joi");
const mongoose = require("mongoose");
const validator = require("validator");
Joi.objectId = require("joi-objectid")(Joi);
const { Comment } = require('./comment')
const { deleteFile } = require('../util/forUploadFile/fileDelete')
const schemaPost = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "name must be gretar than 5 charactar"],
      maxlength: [50, "name must be less  50 charactar"]
    },
    filesUrl: {
      type: [String],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    disLikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    loves: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  },
  {
    timestamps: true, toObject: { virtuals: true }
  }
);

schemaPost.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});


schemaPost.virtual('likesCount').get(function () {
  return this.likes.length;
});

schemaPost.virtual('disLikeCount').get(function () {
  return this.disLikes.length;
});

schemaPost.virtual('lovesCount').get(function () {
  return this.loves.length;
});


schemaPost.statics.validatePost = (post) => {
  const schema = {
    description: Joi.string().required().min(5).max(50),
    filesUrl: Joi.any()
  };

  const { error } = Joi.object(schema).validate(post);

  if (error) {
    const errors = new Error("invalid input");
    errors.data = error.details[0].message;
    errors.code = 400;
    throw errors;
  }
};


schemaPost.pre("remove", async function (next) {
  const post = this;
  const comments = await Comment.find({ post: post._id });
  try {
    comments.forEach(comment => {
      deleteFile(comment.fileUrl)
    });
  } catch (err) {
    throw err
  }
  await Comment.deleteMany({ post: post._id });
  next();
});

const Post = mongoose.model("Post", schemaPost);

exports.Post = Post;
