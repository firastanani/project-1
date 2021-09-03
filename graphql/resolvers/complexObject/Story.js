const { User } = require("../../../models/user");

module.exports = {
  Story: {
    author: async function (parent, args, ctx, info) {
      const author = await User.findById(parent.author);
      return author;
    },
  },
  MyStory: {
    story: async function (parent, args, ctx, info) {
      return parent;
    },
    viewers: async function (parent, args, ctx, info) {

      let viewers = await User.find({ _id: { $in: parent.viewers } });
      return viewers;

    },
    viewerCount: async function (parent, args, ctx, info) {
      return parent.viewers ? parent.viewers.length : 0;
    },
  }
};