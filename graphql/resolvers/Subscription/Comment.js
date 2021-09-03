const { Post } = require("../../../models/post");
const validateID = require('../../../util/idValidate')
module.exports = {
 
  Subscription: {
    comment: {
      subscribe: function (parent, { postID }, { pubsub }, info) {
        validateID(postID);
        const post = Post.findById(postID);
        if (!post) {
          const error = new Error("not found post");
          error.code = 401;
          throw error;
        }
        
        return pubsub.asyncIterator(`comment ${postID}`);
      },
    },
  },
};
