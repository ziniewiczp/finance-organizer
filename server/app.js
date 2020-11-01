const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { GraphQLLocalStrategy, buildContext } = require("graphql-passport");
const passport = require("passport");
const { typeDefs, resolvers } = require("./schema");
const cors = require("cors");
const session = require("express-session");
const uuid = require("uuid");
const { pool } = require("./config");

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
};
  
app.use(cors(corsOptions));

const SESSION_SECRET = "some-secret";

app.use(session({
    genid: (req) => uuid.v4(),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, getMatchingUserById(id));
});

passport.use(
    new GraphQLLocalStrategy((login, password, done) => {
        const matchingUser = getMatchingUserByCredentials(login, email);
        const error = matchingUser ? null : new Error('no matching user');
        done(error, matchingUser);
    })
);

app.use(passport.initialize());
app.use(passport.session());

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => buildContext({ req, res })
});
  
server.applyMiddleware({ app, cors: false });

app.listen((process.env.PORT || 3002), () => {
    console.log("Server listening");
});

const getMatchingUserById = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT name, password
            FROM users
            WHERE id = $1`,
            [id], 
            (error, result) => {
                if (error) { reject(error); }

                resolve(result.rows[0]);
            }
        );
    });
}

const getMatchingUserByCredentials = (login, password) => {
    return new Promise((resolve, reject) => {
        pool.query(`
            SELECT name, password
            FROM users
            WHERE login = $1 AND password = $2`,
            [login, password], 
            (error, result) => {
                if (error) { reject(error); }

                resolve(result.rows[0]);
            }
        );
    });
}