const { User } = require("../../../models/user");
const checkAuth = require("../../../middleware/checkAuth");
const {Message} = require("../../../models/message");
module.exports = {
  Query: {
    getUsers: checkAuth.createResolver(async (_, __, ctx) => {
      try {
        let { user } = ctx.req;
        let users = await User.find({}).select({
          name : 1,
          email: 1,
          imageUrl: 1,
          createdAt: 1,
        });
        let index = users.findIndex((user) => user._id.equals(ctx.req.user._id));
        if (index !== -1) {
          users.splice(index , 1);
        }

//  email: { $nq: user.email } 
        const allUserMessages = await Message.find()
          .or([{ author: user._id }, { receiverMail: user._id }])
          .sort({ createdAt: -1 });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find((message) => {
            return (
              message.author === otherUser._id ||
              message.receiverMail === otherUser._id
            );
          });
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    }),
    hello: function (parent, args, ctx, info) {
      return "Hello";
    }, 
    getMe: checkAuth.createResolver(function (parent, args, ctx, info) {
      return ctx.req.user;
    }),
    getProfile: checkAuth.createResolver(async function (
      parent,
      args,
      ctx,
      info
    ) {
      const profileId = args.userId;

      const profile = await User.findById(profileId);

      if (!profile) {
        const errors = new Error("User you want not found");
        errors.code = 404;
        throw errors;
      }

      return profile;
    }),
  },
};
