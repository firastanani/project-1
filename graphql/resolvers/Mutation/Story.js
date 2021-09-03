const { Story } = require("../../../models/story");
const checkAuth = require("../../../middleware/checkAuth");
const {processUpload} = require('../../../util/forUploadFile/fileUplad');

module.exports = {
 
  Mutation: {
    addStory: checkAuth.createResolver(
      async function (parent, args, ctx, info) {

        let uploadFile = await processUpload(args.image);

        if (!uploadFile.success) {
          const errors = new Error("Faild uploading file");
          errors.code = 400;
          throw errors;
        }

        let story = new Story({
          imageUrl: uploadFile.Location,
          author: ctx.req.user._id,
          viewers: [],
        })

        story = await story.save();

        return story;
      }
    ),
    storySeen: checkAuth.createResolver(
      async function (parent, args, ctx, info) {

        const id = args.id;

        const user = ctx.req.user;

        let story = await Story.findById(id);

        if (!story) {
          const errors = new Error("story not found");
          errors.code = 404;
          throw errors;
        }

        const seen = story.viewers.includes(user._id);

        if (seen) return true;

        story.viewers.push(user._id);
        story = await story.save();

        return true;
      }
    ),
  },

};