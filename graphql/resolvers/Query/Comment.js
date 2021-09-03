const { Post } = require("../../../models/post");
const { Comment } = require("../../../models/comment");
const checkAuth = require("../../../middleware/checkAuth");

module.exports = {
  Query: {
    getComment: checkAuth.createResolver(async function (parent, data, ctx, info) {
      let comments = await Comment.find({});
      return comments;
    }),

    getCommentForPost: checkAuth.createResolver(async function (parent, data, ctx, info) {
      postId = data.postId;
      const post = await Post.findById(postId).populate("comments");
      return post.comments;
    }),
  },

};
