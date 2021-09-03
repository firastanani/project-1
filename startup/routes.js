const express = require("express");
const verification = require("../routes/verification");
const post = require("../routes/post");
const { graphqlUploadExpress } = require("graphql-upload");
const setAuth = require("../middleware/setAuth");
const { User } = require("../models/user");
const cors = require('cors')
module.exports = function (app) {
 
  app.use(cors())
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use("/confirmation", verification);
  app.use(setAuth);
  app.use(graphqlUploadExpress());
  app.use("/post", post);
};
