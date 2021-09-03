const { GraphQLUpload } = require("graphql-upload");
const {processUpload} = require("../../../util/forUploadFile/fileUplad");
module.exports = {
  Upload: GraphQLUpload,

  Mutation: {
    singleUpload: function (parent, { file }) {
      return processUpload(file);
    },

    multipleUpload: async function (parent, { files }) {
      var Files = [];
      await Promise.all(files.map(processUpload))
        .then((result) => {
          Files.push(result);
        })

        .catch((error) => (error.message));
      return Files[0];
    },
  },
};
