const { createResolver } = require('apollo-resolvers');

module.exports = createResolver(
  (parent, args, ctx, error) => {
    if (!ctx.req.isAuth) {
      const errors = new Error("Authentication falild");
      errors.code = 401;
      throw errors;
    }
    // console.log(createResolver().createResolver)
  }
);