const { makeExecutableSchema } = require("graphql-tools");
const { fileLoader, mergeResolvers , mergeTypes } = require("merge-graphql-schemas");
const path = require("path");

const resolversArray = fileLoader(path.join(__dirname, "../graphql/resolvers"), { extensions: [".js"] ,   recursive: true } );
const typesArray = fileLoader(path.join(__dirname, "../graphql/schemas"), {extensions: [".graphql"]});
const resolvers = mergeResolvers(resolversArray);
const typeDefs = mergeTypes(typesArray);
const schema = makeExecutableSchema({ typeDefs, resolvers });
module.exports = schema;
