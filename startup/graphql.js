const { ApolloServer, PubSub } = require("apollo-server-express");
const { execute, subscribe } = require("graphql");
const { createServer } = require("http");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const config = require("config");
const schema = require('../graphql/schema')
const forContextSup = require('../middleware/forContextSup')
module.exports = function (app) {
  const pubsub = new PubSub();
  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => {
      return { req: req, res: res, pubsub };
    },
    formatError: (err) => {
      if (!err.originalError) {
        console.log(err);
        return err;
      }

      const data = err.originalError.data;
      const message = err.message || "An error occured.!";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
    uploads: false,
  });

  server.applyMiddleware({ app });

  const httpServer = createServer(app);

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams) {
        if (connectionParams.Authorization) {
          let user = await forContextSup(connectionParams);
          return {user , pubsub }
        }
        throw new Error("Missing auth token!");
      },
    },
    { server: httpServer }
  );

  const PORT = process.env.PORT || 4000;
  const mongoose = require("mongoose");
  const db = config.get("db");
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then((res) => {
      httpServer.listen(PORT, () => {
        console.log(
          `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
        );
        console.log(
          `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
        );
      });
    })
    .catch((err) => {
      console.error("Error while connecting to MongoDB", err);
    });
};
