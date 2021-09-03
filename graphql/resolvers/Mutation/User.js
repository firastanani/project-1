const { User } = require("../../../models/user");
const sendEmail = require("../../../util/forConfirmEmail/sendEmail");
const checkAuth = require("../../../middleware/checkAuth");
const createUrlConfirmEmail = require("../../../util/forConfirmEmail/createUrlConfirmEmail");
const { createResolver } = require("apollo-resolvers");
const { processUpload } = require("../../../util/forUploadFile/fileUplad");
const { deleteFile } = require("../../../util/forUploadFile/fileDelete");
const { Friends } = require("../../../models/friend");
const { Requests } = require("../../../models/request");
const { Pennding } = require("../../../models/pennding");
const {
  sendNotRequsetFriend,
  acceptNotRequestFriend,
} = require("../../../util/forNotification/notificationFriend");
const validateID = require("../../../util/idValidate");
const bcrypt = require("bcrypt");

module.exports = {
  Mutation: {
    createUser: createResolver(async function (parent, { data }, ctx, info) {
      User.validateUser(data);
      const existingUser = await User.findOne({
        email: data.email,
      });
      if (existingUser) {
        const errors = new Error("User already exist");
        errors.code = 400;
        throw errors;
      }
      let uploadFile;
      console.log(data.image);
      if (data.image) {
        uploadFile = await processUpload(data.image);
        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        }
      }

      let user = new User({
        name: data.name,
        password: data.password,
        email: data.email,
        age: data.age,
        imageUrl: uploadFile ? uploadFile.Location : null,
        confirm: false,
      });
      user = await user.save();

      const baseUrl = ctx.req.protocol + "://" + ctx.req.get("host");
      await sendEmail(data.email, createUrlConfirmEmail(user._id, baseUrl));

      return user;
    }),
    updateUser: checkAuth.createResolver(async function (parent, args, ctx, info) {
      User.validateUpdateUser(args.data);
      const { data } = args;

      let user = await User.findById(ctx.req.user._id);

      let uploadFile;
      if (data.image) {
        uploadFile = await processUpload(data.image);
        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        } else {
          if (user.imageUrl) deleteFile(user.imageUrl);
          user.imageUrl = uploadFile.Location;
        }
      }

      user.name = data.name ? data.name : user.name;
      user.age = data.age ? data.age : user.age;

      await user.save();

      return user;
    }),
    deleteUser: checkAuth.createResolver(async function (
      parent,
      { id },
      ctx,
      info
    ) {
      let user = await User.findById(id);

      if (!user) {
        const errors = new Error("user not found");
        errors.code = 404;
        throw errors;
      }

      if (!user._id.equals(ctx.req.user._id)) {
        const errors = new Error("can't remove others account");
        errors.code = 401;
        throw errors;
      }

      if (user.imageUrl) deleteFile(user.imageUrl);

      user = await user.remove();

      return user;
    }),

    acceptFriendRequest: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const id = args.id;
      let user = ctx.req.user;
      validateID(id);

      let UserToBeFriend = await User.findById(id);

      if (!UserToBeFriend) {
        const errors = new Error("UserToBeFriend not found");
        errors.code = 404;
        throw errors;
      }

      const isFriends = await Friends.exists({
        $or: [
          { user1: user._id, user2: id },
          { user2: user._id, user1: id },
        ],
      });

      if (isFriends) {
        const errors = new Error("He's alredy your friend");
        errors.code = 404;
        throw errors;
      }

      let friendRequest = await Requests.find({ from: id });
      if (friendRequest.length == 0) {
        const errors = new Error("this user don't send you frined request");
        errors.code = 404;
        throw errors;
      }

      await Requests.deleteOne({ from: id, to: user._id });

      let friends = new Friends({
        user1: user,
        user2: UserToBeFriend,
      });
      await friends.save();

      await acceptNotRequestFriend(
        ctx.req.user.name,
        ctx.req.user._id,
        id,
        ctx.pubsub
      );

      return user;
    }),

    sendaFriendRequest: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const id = args.id;
      validateID(id);

      let user = ctx.req.user;
      let UserToBeFriend = await User.findById(id);

      if (!UserToBeFriend) {
        const errors = new Error("UserToBeFriend not found");
        errors.code = 404;
        throw errors;
      }

      const checkStatuPennding = await Pennding.exists({
        user1: id,
        user2: user._id,
      });

      if (checkStatuPennding) {
        const errors = new Error(
          "can't send request to user now must be wait after 1 month"
        );
        errors.code = 404;
        throw errors;
      }

      const isFriends = await Friends.exists({
        $or: [
          { user1: user._id, user2: id },
          { user2: user._id, user1: id },
        ],
      });

      if (isFriends) {
        const errors = new Error("He's alredy your friend");
        errors.code = 404;
        throw errors;
      }

      const doIsentHimFriendRequest = await Requests.exists({
        from: user._id,
        to: id,
      });

      if (doIsentHimFriendRequest) {
        const errors = new Error("you already sent him a friend request");
        errors.code = 404;
        throw errors;
      }

      const doHeSentMeFriendRequest = await Requests.exists({
        from: id,
        to: user._id,
      });

      if (doHeSentMeFriendRequest) {
        const errors = new Error("He send you a friend request");
        errors.code = 404;
        throw errors;
      }

      let Requset = new Requests({
        from: user._id,
        to: id,
      });
      await Requset.save();

      await sendNotRequsetFriend(
        ctx.req.user.name,
        ctx.req.user._id,
        id,
        ctx.pubsub
      );

      return user;
    }),

    deleteFriend: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const id = args.id;
      validateID(id);

      let user = ctx.req.user;
      let UserToDelete = await User.findById(id);

      if (!UserToDelete) {
        const errors = new Error("UserToDelete not found");
        errors.code = 404;
        throw errors;
      }

      let friend1 = await Friends.deleteOne({
        user1: user._id,
        user2: id,
      });
      let friend2 = await Friends.deleteOne({
        user2: user._id,
        user1: id,
      });

      if (friend1.deletedCount == 0 && friend2.deletedCount == 0) {
        const errors = new Error("alredy user not friend with you");
        errors.code = 404;
        throw errors;
      }

      return user;
    }),

    deleteFriendRequestSent: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const id = args.id;
      validateID(id);

      let user = ctx.req.user;
      let UserToDeleteRequest = await User.findById(id);

      if (!UserToDeleteRequest) {
        const errors = new Error("UserToBeFriend not found");
        errors.code = 404;
        throw errors;
      }

      let request = await Requests.deleteOne({
        from: user._id,
        to: id,
      });

      if (request.deletedCount == 0) {
        const errors = new Error("don't have request to remove ");
        errors.code = 404;
        throw errors;
      }

      return user;
    }),

    rejectFriendRequest: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const id = args.id;
      validateID(id);

      let user = ctx.req.user;
      let UserToDeleteRequest = await User.findById(id);

      if (!UserToDeleteRequest) {
        const errors = new Error("UserToBeFriend not found");
        errors.code = 404;
        throw errors;
      }

      let request = await Requests.deleteOne({
        from: id,
        to: user._id,
      });

      if (request.deletedCount == 0) {
        const errors = new Error("don't have request to remove ");
        errors.code = 404;
        throw errors;
      }

      let pennding = new Pennding({
        user1: user._id,
        user2: id,
      });
      await pennding.save();

      return user;
    }),
    resetPassword: checkAuth.createResolver(async function (parent, args, ctx, info) {
      const user = ctx.req.user;
      const newPassword = args.newPassword;
      const oldPassword = args.oldPassword;

      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) throw new Error("Invalid password.");

      user.password = newPassword;
      user.tokens = [];
      user.tokens.push(ctx.req.token);
      await user.save();
      return true;
    }),
    changeFriendsPrivacy: checkAuth.createResolver(async function (parent, { friendsPrivacy }, ctx, info) {
      const user = ctx.req.user;
      user.friendsPrivacy = friendsPrivacy
      await user.save();

      return true;
    }),
  },
};
