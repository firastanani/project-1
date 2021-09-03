const { User } = require("../../../models/user");
const { Post } = require("../../../models/post");
const { Friends } = require("../../../models/friend");
const { Requests } = require("../../../models/request");

module.exports = {
  // UserForChat: {
  //   latestMessage: async (parent, args, ctx, info) => {
  //     const message = await Message.find({ _id: parent._id });
  //     return message;
  //   },
  // },
  User: {

    posts: async function (parent, args, ctx, info) {

      const user = ctx.req.user;

      const isFriends = await Friends
        .exists({ $or: [{ user1: parent._id, user2: user._id }, { user1: user._id, user2: parent._id }] });

      if (user._id.equals(parent._id) || isFriends) {
        const posts = await Post.find({
          author: parent._id,
        }).sort({
          createdAt: -1,
        });
        return posts;
      }

      return [];
    },
    friendRequestsSent: async function (parent, data, ctx, info) {
      if (parent._id.equals(ctx.req.user._id)) {

        let friendRequestsSent = [];
        friendRequestsSent = await Requests.find({ from: parent._id });
        let users = [];
        for (let i = 0; i < friendRequestsSent.length; i++) {
          let user = await User.findById(friendRequestsSent[i].to);
          users.push(user);
        }
        return users;
      }
      return [];
    },
    friendRequestsReceived: async function (parent, data, ctx, info) {
      if (parent._id.equals(ctx.req.user._id)) {
        let friendRequestsReceived = [];
        friendRequestsReceived = await Requests.find({ to: parent._id });
        let users = [];
        for (let i = 0; i < friendRequestsReceived.length; i++) {
          let user = await User.findById(friendRequestsReceived[i].from);
          users.push(user);
        }
        return users;
      }
      return [];
    },
    friends: async function (parent, data, ctx, info) {
      const state = parent.friendsPrivacy;
      const userToGetFriendsId = parent._id;
      const friendsRelations = await Friends.find().or([{ user1: userToGetFriendsId }, { user2: userToGetFriendsId }]);
      const friendsIds = friendsRelations.map(friendsRelations => {
        return friendsRelations.user1.equals(userToGetFriendsId) ? friendsRelations.user2 : friendsRelations.user1;
      })
      const friends = await User.find({ _id: { $in: friendsIds } });

      if(userToGetFriendsId.equals(ctx.req.user._id)){
        return { friendsData: friends, friendsCount: friends.length };
      }

      switch (state) {
        case 'FRIENDS':
          const isFriends = await Friends
            .exists({ $or: [{ user1: parent._id, user2: ctx.req.user._id }, { user1: ctx.req.user._id, user2: parent._id }] });
          if (isFriends) {
            return { friendsData: friends, friendsCount: friends.length };
          }
        case 'PRIVATE':
          return { friendsData: [], friendsCount: 0 };
        default:
          return { friendsData: friends, friendsCount: friends.length };

      }

    },
    mutualFriends: async function (parent, data, ctx, info) {
      const userId = parent._id;
      const myUser = ctx.req.user;

      const myUserFriendsRelation = await Friends.find().or([{ user1: myUser._id }, { user2: myUser._id }])
      const myUserFriendsIds = myUserFriendsRelation.map(friendsRelations => {
        return friendsRelations.user1.equals(myUser._id) ? friendsRelations.user2 : friendsRelations.user1;
      })

      const userFriendsRelation = await Friends.find().or([{ user1: userId }, { user2: userId }])
      const userFriendsIds = userFriendsRelation.map(friendsRelations => {
        return friendsRelations.user1.equals(userId) ? friendsRelations.user2 : friendsRelations.user1;
      })

      //intersection between myFriends and your Friends
      let mutualFriendsIds = []
      userFriendsIds.forEach(elementF => {
        myUserFriendsIds.forEach(elementA => {
          if (elementF.equals(elementA)) {
            mutualFriendsIds.push(elementF)
          }
        });
      });

      console.log(mutualFriendsIds)
      const mutualFriends = await User.find({ _id: { $in: mutualFriendsIds } });

      return { mutualFriendsData: mutualFriends, mutualFriendsCount: mutualFriends.length };
    },
    isFriends: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const profileId = parent._id;

      return isFriends = await Friends
        .exists({ $or: [{ user1: user._id, user2: profileId }, { user1: profileId, user2: user._id }] });
    },
    doISentHimFriendRequest: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const profileId = parent._id;

      return doISentHimFriendRequest = await Requests
        .exists({ from: user._id, to: profileId });

    },
    doHeSentMeFriendRequest: async function (parent, data, ctx, info) {

      const user = ctx.req.user;
      const profileId = parent._id;

      return doISentHimFriendRequest = await Requests
        .exists({ from: profileId, to: user._id });
    },
  }
}
