const { User } = require("../../../models/user");
const { Story } = require("../../../models/story");
const checkAuth = require("../../../middleware/checkAuth");
const {Friends} = require('../../../models/friend');

module.exports = {
  Query: {
    stories:
      checkAuth.createResolver(
        async function (parent, args, ctx, info) {

          const userToGetFriendsId = ctx.req.user._id;

          const friendsRelations = await Friends.find().or([{ user1: userToGetFriendsId }, { user2: userToGetFriendsId }]);
    
          const friendsIds = friendsRelations.map(friendsRelations => {
            return friendsRelations.user1.equals(userToGetFriendsId) ? friendsRelations.user2 : friendsRelations.user1;
          })
    
          let friends = await User.find({ _id: { $in: friendsIds } }).populate('stories');

          friends = friends.filter((element) => {
            return element.stories.length > 0;
          })

          return friends;
        }
      ),
    story: checkAuth.createResolver(

      async function (parent, args, ctx, info) {

        const story = await Story.findById(args.storyId);

        if (!story) {
          const errors = new Error("story not found");
          errors.code = 404;
          throw errors;
        }
        return story;
      }),
    myStories: checkAuth.createResolver(
      async function (parent, args, ctx, info) {
        const user = ctx.req.user;
        const stories = await Story.find({ author: user._id });

        return stories;
      }),
  },

};