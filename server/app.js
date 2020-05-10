const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphql = require('graphql');
const cors = require("cors");
const { pool } = require("./config");

const categoryType = new graphql.GraphQLObjectType({
    name: "Category",
    fields: {
        id : { type: graphql.GraphQLID },
        name: { type: graphql.GraphQLString }
    }
});

const expenseType = new graphql.GraphQLObjectType({
    name: "Expense",
    fields: {
        id: { type: graphql.GraphQLID },
        title: { type: graphql.GraphQLString },
        sum: { type: graphql.GraphQLString },
        date: { type: graphql.GraphQLString },
        category: { type: categoryType }
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
                            expenses.id AS id,
                            expenses.title AS title,
                            expenses.sum AS sum,
                            expenses.date AS date,
                            categories.id AS category_id,
                            categories.name AS category_name
                        FROM expenses INNER JOIN categories ON expenses.category = categories.id
                        WHERE EXTRACT(MONTH FROM expenses.date) = $1
                        ORDER BY expenses.date`, [args.month], (error, results) => {

                        if (error) { reject(error); }

                        results.rows.forEach((expense) => {
                            expense.date.setDate(expense.date.getDate() + 1);
                            expense.date = expense.date.toISOString().slice(0, 10);

                            expense.category = {
                                id : expense.category_id,
                                name : expense.category_name
                            }
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
                    pool.query(`INSERT INTO expenses (title, sum, date) VALUES ($1, $2, $3) RETURNING (id, title, date, sum)`,
                        [args.title, args.sum.replace(/,/g, "."), args.date],
                        (error, result) => {
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
                    pool.query("UPDATE expenses SET title = $1, sum = $2, date = $3 WHERE id = $4", 
                        [args.title, args.sum.replace(/,/g, "."), args.date, args.id],
                        error => {
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