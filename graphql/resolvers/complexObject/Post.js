const _ = require("lodash");
const { User } = require("../../../models/user");
module.exports = {
 
  Post: {
    author: async function (parent, data, ctx, info) {
      const authorId = parent.author;
      const author = await User.findById(authorId);
      return author;
    },
    likes: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const post = parent;

      let iLike = false;

      let likers = [];
      for (let i = 0; i < post.likes.length; i++) {


        if (post.likes[i]._id.equals(user._id)) {
          iLike = true;
          continue;
        };

        let liker = await User.findById(post.likes[i]._id);
        likers.push(liker)
      }

      if (iLike) {
        likers.unshift(user);
      }

      return likers;
    },
    disLikes: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const post = parent;

      let iDisLike = false;

      let disLikers = [];
      for (let i = 0; i < post.disLikes.length; i++) {

        if (post.disLikes[i]._id.equals(user._id)) {
          iDisLike = true;
          continue;
        }

        let disliker = await User.findById(post.disLikes[i]._id);
        disLikers.push(disliker)
      }

      if (iDisLike) {
        disLikers.unshift(user);
      }

      return disLikers;
    },
    loves: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const post = parent;

      let iLove = false;

      let lovers = [];
      for (let i = 0; i < post.loves.length; i++) {

        if (post.loves[i]._id.equals(user._id)) {
          iLove = true;
          continue;
        }

        let lover = await User.findById(post.loves[i]._id);
        lovers.push(lover)
      }

      if (iLove) {
        lovers.unshift(user);
      }

      return lovers;
    },
    myReaction: async function (parent, data, ctx, info) {
      let post = parent;
      let user = ctx.req.user;

      let index = post.likes.findIndex((like) => like._id.equals(user._id));
      if (index !== -1) {
        return "LIKE"
      }

      index = post.disLikes.findIndex((dislike) => dislike._id.equals(user._id));
      if (index !== -1) {
        return "DISLIKE";
      }

      index = post.loves.findIndex((love) => love._id.equals(user._id));
      if (index !== -1) {
        return "LOVE";
      }

      return "NONE"
    },
  },
};
