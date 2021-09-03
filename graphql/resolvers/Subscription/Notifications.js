
module.exports = {
  Subscription: {
    newNotification: {
      subscribe: (parent, args, ctx) =>
        ctx.pubsub.asyncIterator(`${ctx.user._id}`),
    },
  },

};
