const checkAuth = require("../../../middleware/checkAuth");

module.exports = {
  Mutation: {
    logout: checkAuth.createResolver(async function (parent, args, ctx, info) {
      ctx.req.user.tokens = ctx.req.user.tokens.filter((token) => {
        return ctx.req.token !== token;
      });

      const result = await ctx.req.user.save();

      return result ? true : false;
    }),
    
    logoutAll: checkAuth.createResolver(async function (parent, args, ctx, info) {
      ctx.req.user.tokens = [];
      const result = await ctx.req.user.save();
      return result ? true : false;
    }),
  },
};
