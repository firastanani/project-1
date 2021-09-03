const { Post } = require("../../../models/post");
const { Comment } = require("../../../models/comment");
const checkAuth = require("../../../middleware/checkAuth");
const { deleteFile } = require("../../../util/forUploadFile/fileDelete");
const { processUpload } = require("../../../util/forUploadFile/fileUplad");
const notificationComment = require("../../../util/forNotification/notificationComment");
const validateID = require("../../../util/idValidate");
module.exports = {
  Mutation: {
    createComment: checkAuth.createResolver(async function (parent, { data }, ctx, info) {
      Comment.validateCreateComment(data);

      const pubsub = ctx.pubsub;
      const existingPost = await Post.findOne({ _id: data.postId });
      if (!existingPost) {
        const errors = new Error("Post deleted !!");
        errors.code = 400;
        throw errors;
      }

      let uploadFile;
      if (data.fileUrl) {
        uploadFile = await processUpload(data.fileUrl);

        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        }
      }

      data.fileUrl = uploadFile ? uploadFile.Location : null;
      data.post = data.postId;
      data.author = ctx.req.user._id;

      let comment = new Comment(data);
      comment = await comment.save();

      pubsub.publish(`comment ${data.postId}`, {
        comment: {
          mutation: "Create",
          data: comment,
        },
      });

      if (!ctx.req.user._id.equals(existingPost.author)) {
        await notificationComment(ctx.req.user.name, ctx.req.user._id, existingPost.author, ctx.pubsub);
      }

      return comment;
    }),

    deleteComment: checkAuth.createResolver(async function (
      parent,
      { commentId },
      ctx,
      info
    ) {
      const pubsub = ctx.pubsub;
      validateID(commentId);

      let comment = await Comment.findById(commentId);

      if (!comment) {
        const errors = new Error("comment not found");
        errors.code = 404;
        throw errors;
      }

      if (!comment.author.equals(ctx.req.user._id)) {
        const errors = new Error("can't remove others comments");
        errors.code = 401;
        throw errors;
      }

      if (comment.fileUrl) deleteFile(comment.fileUrl);

      comment = await comment.remove();
      console.log(ctx.req.user)
      console.log(comment.author)
      comment.author = ctx.req.user;
      console.log(comment.author)

      pubsub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: "delete",
          data: comment,
        },
      });
      return comment;
    }),
    updateComment: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      Comment.validateUpdateComment(args.data);

      const pubsub = ctx.pubsub;
      const { commentId, data } = args;
      validateID(commentId);

      const comment = await Comment.findOne({
        _id: commentId,
        author: ctx.req.user._id,
      });

      if (!comment) {
        const errors = new Error("comment not found");
        errors.code = 404;
        throw errors;
      }

      let uploadFile;
      if (data.fileUrl) {
        uploadFile = await processUpload(data.fileUrl);
        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        } else {
          if (comment.fileUrl) deleteFile(comment.fileUrl);
          comment.fileUrl = uploadFile.Location;
        }
      }

      comment.text = data.text;
      await comment.save();
      pubsub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: "update",
          data: comment,
        },
      });
      return comment;
    }),
  },
};
