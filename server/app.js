const express = require("express");
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');
const cors = require("cors");

const app = express();
app.use(cors());

const server = new ApolloServer({
    typeDefs,
    resolvers
});
  
server.applyMiddleware({ app });

app.listen((process.env.PORT || 3002), () => {
    console.log("Server listening");
});