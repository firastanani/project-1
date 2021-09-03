const { Post } = require("../../../models/post");
const checkAuth = require("../../../middleware/checkAuth");
const { Friends } = require('../../../models/friend');

module.exports = {
  Query: {
    getPosts: checkAuth.createResolver(async function (parent, data, ctx, info) {
      let posts = await Post.find().sort({ createdAt: -1 });
      return posts;
    }),

    getPostsOnFriends: checkAuth.createResolver(async function (parent, data, ctx, info) {
      const user = ctx.req.user;

      const friendsRelations = await Friends.find().or([{ user1: user._id }, { user2: user._id }]);

      const friends = friendsRelations.map(friendsRelations => {
        return friendsRelations.user1.equals(user._id) ? friendsRelations.user2 : friendsRelations.user1;
      })

      const posts = await Post.find({ author: { $in: [...friends, user._id] } }).sort({ createdAt: -1 })

      return posts;
    }),
  },

 
};
