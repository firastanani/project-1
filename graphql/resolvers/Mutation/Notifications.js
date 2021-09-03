const { Notification } = require("../../../models/notification");

module.exports = {
  Mutation: {
    pushNotification: async (root, args, ctx, info) => {

      const newNotification = new Notification({
        label: args.label,
        from: ctx.req.user._id,
        to: args.id,
      });

      await newNotification.save();

      ctx.pubsub.publish(newNotification.to, {
        newNotification: newNotification,
      });

      return newNotification;
    },
  },
};
