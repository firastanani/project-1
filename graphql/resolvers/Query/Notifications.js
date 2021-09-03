const { Notification } = require("../../../models/notification");
const checkAuth = require("../../../middleware/checkAuth");

module.exports = {
  Query: {
    notifications: checkAuth.createResolver(async (parent, args, ctx, info) => {
      const notifications = await Notification.find({ to: ctx.req.user._id });
      return notifications;
    }),
  },
};
