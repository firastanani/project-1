const { Post } = require("../../../models/post");
const { User } = require("../../../models/user");
module.exports = {
  Comment: {
    author: async function (parent, data, ctx, info) {
      console.log(parent.author)
      const author = await User.findOne({ _id: parent.author });
      console.log(author)
      return author;
    },
    post: async function (parent, data, ctx, info) {
      const post = await Post.findOne({ _id: parent.post });
      return post;
    },
  },
};
