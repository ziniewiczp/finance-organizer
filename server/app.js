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
        sum: { type: graphql.GraphQLString },
        date: { type: graphql.GraphQLString }
    }
});

const queryType = new graphql.GraphQLObjectType({
    name: "Query",
    fields: {
        expenses: {
            type: new graphql.GraphQLList(expenseType),
            args: {
                month: { type: graphql.GraphQLInt }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query(`
                        SELECT
                            id,
                            title,
                            sum,
                            date
                        FROM expenses
                        WHERE EXTRACT(MONTH FROM date) = $1
                        ORDER BY date`, [args.month], (error, results) => {
                        
                        if (error) {
                            reject(error);
                        }
                        results.rows.forEach((expense) => {
                            expense.date.setDate(expense.date.getDate() + 1);
                            expense.date = expense.date.toISOString().slice(0, 10);
                        });

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
                sum: { type: graphql.GraphQLString },
                date: { type: graphql.GraphQLString }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("INSERT INTO expenses (title, sum, date) VALUES ($1, $2, $3) RETURNING (id, title, date, sum)", [args.title, args.sum, args.date], (error, result) => {
                        if (error) {
                            reject(error);
                        }
                        
                        const returnedValues = result.rows[0].row
                            .replace(/([ ( ) ])/g, "")
                            .split(",");
                        
                        resolve({
                            id: returnedValues[0],
                            title: returnedValues[1],
                            date: returnedValues[2],
                            sum: returnedValues[3]
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
                sum: { type: graphql.GraphQLString },
                date: { type: graphql.GraphQLString }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    pool.query("UPDATE expenses SET title = $1, sum = $2, date = $3 WHERE id = $4", [args.title, args.sum, args.date, args.id], error => {
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