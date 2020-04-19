const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphql = require('graphql');
const cors = require("cors");
const { pool } = require("./config");

const expenseElementType = new graphql.GraphQLObjectType({
    name: "ExpenseElement",
    fields: {
        id: { type: graphql.GraphQLID },
        title: { type: graphql.GraphQLString },
        sum: { type: graphql.GraphQLString },
    }
});

const expenseType = new graphql.GraphQLObjectType({
    name: "Expense",
    fields: {
        id: { type: graphql.GraphQLID },
        title: { type: graphql.GraphQLString },
        sum: { type: graphql.GraphQLString },
        date: { type: graphql.GraphQLString },
        expenseElements: { type: graphql.GraphQLList(expenseElementType) }
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
                            e.id as id,
                            e.title as title,
                            e.sum as sum,
                            e.date as date,
                            ee.id as expense_element_id,
                            ee.title as expense_element_title,
                            ee.sum as expense_element_sum
                        FROM expenses e LEFT OUTER JOIN expense_elements ee ON e.id = ee.expense_id
                        WHERE EXTRACT(MONTH FROM e.date) = $1
                        ORDER BY e.date`, [args.month], (error, results) => {
                            if (error) { reject(error); }
                            
                            const expenses = new Map();
                            results.rows.forEach((expense) => {
                                expense.date.setDate(expense.date.getDate() + 1);
                                expense.date = expense.date.toISOString().slice(0, 10);
                                
                                if(expenses.has(expense.id)) {
                                    const existingExpense = expenses.get(expense.id);
                                    if(expense.expense_element_id) { 
                                        existingExpense.expenseElements.push({
                                            id : expense.expense_element_id,
                                            title: expense.expense_element_title,
                                            sum : expense.expense_element_sum    
                                        }); 
                                    }
                                
                                } else {
                                    expense.expenseElements = (!expense.expense_element_id) 
                                        ? [] 
                                        : [{
                                            id : expense.expense_element_id,
                                            title: expense.expense_element_title,
                                            sum : expense.expense_element_sum
                                        }];
                                    expenses.set(expense.id, expense); 
                                }
                            });

                            resolve(expenses);
                        }
                    );
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