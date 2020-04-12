const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphql = require('graphql');
const cors = require("cors");
const { pool } = require("./config");

const expenseType = new graphql.GraphQLObjectType({
    name: "Expense",
    fields: {
        id: { type: graphql.GraphQLID },
        title: { type: graphql.GraphQLString },
        sum: { type: graphql.GraphQLString }
    }
});

const queryType = new graphql.GraphQLObjectType({
    name: "Query",
    fields: {
        expenses: {
            type: new graphql.GraphQLList(expenseType),
            args: {},
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("SELECT * FROM expenses ORDER BY id", (error, results) => {
                        if (error) {
                            reject(error);
                        }
                        resolve(results.rows);
                    });
                });
            }
        }
    }
});

const mutationType = new graphql.GraphQLObjectType({
    name: "Mutation",
    fields: {
        addExpense: {
            type: expenseType,
            args: {
                title: { type: graphql.GraphQLString },
                sum: { type: graphql.GraphQLString }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("INSERT INTO expenses (title, sum) VALUES ($1, $2) RETURNING (id, title, sum)", [args.title, args.sum], (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        
                        const returnedValues = result.rows[0].row
                            .replace(/([ ( ) " ])/g, "")
                            .split(",");

                        returnedValues[2] += `,${returnedValues.pop()}`;
                        
                        resolve({
                            id: returnedValues[0],
                            title: returnedValues[1],
                            sum: returnedValues[2]
                        });
                    });
                });
            }
        },

        updateExpense: {
            type: expenseType,
            args: {
                id: { type: graphql.GraphQLID },
                title: { type: graphql.GraphQLString },
                sum: { type: graphql.GraphQLString }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("UPDATE expenses SET title = $1, sum = $2 WHERE id = $3", [args.title, args.sum, args.id], error => {
                        if (error) {
                            reject(error);
                        }

                        resolve();
                    });
                });
            }
        },

        deleteExpense: {
            type: expenseType,
            args: {
                id: { type: graphql.GraphQLID }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("DELETE FROM expenses WHERE id = $1", [args.id], error => {
                        if (error) {
                            reject(error);
                        }

                        resolve();
                    });
                });
            }
        }
    }
})

const schema = new graphql.GraphQLSchema({ query: queryType, mutation: mutationType });

const app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

app.listen((process.env.PORT || 3002), () => {
    console.log("Server listening");
});