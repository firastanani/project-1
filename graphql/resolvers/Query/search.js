const { User } = require("../../../models/user");
const checkAuth = require("../../../middleware/checkAuth");
const { Friends } = require("../../../models/friend");

async function isFriends(you, my) {
  const isFriends = await Friends
    .exists({ $or: [{ user1: you, user2: my }, { user1: my, user2: you }] });
  return isFriends;
}
module.exports = {
  Query: {
    textSearch: checkAuth.createResolver(async function (parent, args, ctx, info) {
      
      const user = ctx.req.user;

      let Users = [];

      Users = await User.find({name: { $regex: `^${args.fieldSearch}`, $options: "$i" } , _id: { $ne: user._id} }).sort({ name: 1 });

      let friends = [];
      let notfriends = [];

      for (let i = 0; i < Users.length; i++) {
        if (await isFriends(Users[i]._id, ctx.req.user._id)) {
          friends.push(Users[i]);
        } else {
          notfriends.push(Users[i]);
        }
      }
      
      Users = friends.concat(notfriends);

      return Users;
    }),
  },
};
