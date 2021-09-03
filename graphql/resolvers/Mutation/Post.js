const { Post } = require("../../../models/post");
const checkAuth = require("../../../middleware/checkAuth");
const { deleteMultipleFile } = require("../../../util/forUploadFile/fileDelete");
const { multipleUpload } = require("../../../util/forUploadFile/fileUplad");
const notificationPost = require('../../../util/forNotification/notificationPost');
const validateID = require('../../../util/idValidate')
const notificationReaction = require('../../../util/forNotification/notificationReaction')
module.exports = {

  Mutation: {
    createPost: checkAuth.createResolver(async function (parent, args, ctx, info) {
      Post.validatePost(args.data);
      console.log(args.data)
      let uploadFiles = [];
      let filesLocation = [];

      if (args.data.filesUrl) {
        try {
          uploadFiles = await multipleUpload(args.data.filesUrl);
          console.log(uploadFiles);
          uploadFiles.forEach((file) => {
            filesLocation.push(file.Location);
          });
        } catch (err) {
          throw err;
        }
      }

      let post = new Post({
        description: args.data.description,
        filesUrl: uploadFiles ? filesLocation : null,
        author: ctx.req.user._id,
      });

      post = await post.save();


      await notificationPost(ctx.req.user.name, ctx.req.user._id, ctx.pubsub)
      return post;
    }),

    updatePost: checkAuth.createResolver(async function (parent, args, ctx, info) {
      Post.validatePost(args.data);
      const { id, data } = args;
      validateID(id);

      let post = await Post.findById(id);

      if (!post) {
        const errors = new Error("Post not found");
        errors.code = 404;
        throw errors;
      }

      if (!post.author.equals(ctx.req.user._id)) {
        const errors = new Error("can't update others post");
        errors.code = 401;
        throw errors;
      }

      let uploadFiles = [];
      let filesLocation = [];
      if (args.data.filesUrl) {
        try {
          uploadFiles = await multipleUpload(args.data.filesUrl);
          console.log(uploadFiles);
          uploadFiles.forEach((file) => {
            filesLocation.push(file.Location);
          });
        } catch (err) {
          throw err;
        }

        if (post.filesUrl) deleteMultipleFile(post.filesUrl);
        post.filesUrl = filesLocation;
      }

      post.description = data.description;

      post = await post.save();

      return post;
    }),
    deletePost: checkAuth.createResolver(async function (parent, { id }, ctx, info) {
      validateID(id);

      let post = await Post.findById(id);

      if (!post) {
        const errors = new Error("Post not found");
        errors.code = 404;
        throw errors;
      }

      if (!post.author.equals(ctx.req.user._id)) {
        const errors = new Error("can't remove others posts");
        errors.code = 401;
        throw errors;
      }

      if (post.filesUrl) deleteMultipleFile(post.filesUrl);

      post = await post.remove();

      return post;
    }),
    likePost: checkAuth.createResolver(
      async function (parent, args, ctx, info) {

        const postId = args.postId;
        const user = ctx.req.user;

        let post = await Post.findById(postId);

        if (!post) {
          const errors = new Error("post not found");
          errors.code = 404;
          throw errors;
        }

        let index = post.disLikes.findIndex((dislike) => dislike._id.equals(user._id));
        if (index !== -1) {
          post.disLikes.splice(index, 1);
        }

        index = post.loves.findIndex((love) => love._id.equals(user._id));
        if (index !== -1) {
          post.loves.splice(index, 1);
        }

        index = post.likes.findIndex((like) => like._id.equals(user._id));

        if (index !== -1) {
          post.likes.splice(index, 1);
        } else {
          post.likes.push(user);
        }
        post = await post.save();

        if (!user._id.equals(post.author)) {
          notificationReaction(`${ctx.req.user.name} Like your post `, user._id, post.author, ctx.pubsub)
        }

        return post;
      }
    ),
    disLikePost: checkAuth.createResolver(

      async function (parent, args, ctx, info) {
        const postId = args.postId;
        const user = ctx.req.user;

        let post = await Post.findById(postId);

        if (!post) {
          const errors = new Error("post not found");
          errors.code = 404;
          throw errors;
        }

        let index = post.loves.findIndex((love) => love._id.equals(user._id));
        if (index !== -1) {
          post.loves.splice(index, 1);
        }

        index = post.likes.findIndex((like) => like._id.equals(user._id));
        if (index !== -1) {
          post.likes.splice(index, 1);
        }

        index = post.disLikes.findIndex((dislike) => dislike._id.equals(user._id));

        if (index !== -1) {
          post.disLikes.splice(index, 1);
        } else {
          post.disLikes.push(user);
        }

        post = await post.save();

        if (!user._id.equals(post.author)) {
          notificationReaction(`${ctx.req.user.name} disLike your post `, user._id, post.author, ctx.pubsub)
        }
        return post;
      }
    ),
    lovePost:
      checkAuth.createResolver(
        async function (parent, args, ctx, info) {
          const postId = args.postId;
          const user = ctx.req.user;

          let post = await Post.findById(postId);

          if (!post) {
            const errors = new Error("post not found");
            errors.code = 404;
            throw errors;
          }

          let index = post.likes.findIndex((like) => like._id.equals(user._id));
          if (index !== -1) {
            post.likes.splice(index, 1);
          }

          index = post.disLikes.findIndex((dislike) => dislike._id.equals(user._id));
          if (index !== -1) {
            post.disLikes.splice(index, 1);
          }

          index = post.loves.findIndex((love) => love._id.equals(user._id));

          if (index !== -1) {
            post.loves.splice(index, 1);
          } else {
            post.loves.push(user);
          }

          post = await post.save();

          if (!user._id.equals(post.author)) {
            notificationReaction(`${ctx.req.user.name} Love your post `, user._id, post.author, ctx.pubsub)
          }
          return post;
        }
      ),
  },


};
