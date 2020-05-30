const { gql } = require('apollo-server-express');
const { pool } = require("./config");

const typeDefs = gql`
    type Category {
        id: ID,
        name: String
    }

    type Expense {
        id: ID,
        title: String,
        sum: String,
        date: String,
        category: Category
    }

    type Query {
        expenses(month: Int, year: Int): [Expense],
        categories: [Category]
    }

    type Mutation {
        addExpense(title: String, sum: String, date: String, category: ID): Expense,
        updateExpense(id: ID, title: String, sum: String, date: String, category: ID): Expense
        deleteExpense(id: ID) : Expense
    }
`;

const resolvers = {
    Query: {
        expenses(parent, args, context, info) {
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
                    WHERE EXTRACT(MONTH FROM expenses.date) = $1 AND EXTRACT(YEAR FROM expenses.date) = $2
                    ORDER BY expenses.date`,
                    [args.month, args.year], 
                    (error, results) => {

                        if (error) { reject(error); }

                        results.rows.forEach((expense) => {
                            expense.date.setDate(expense.date.getDate() + 1);
                            expense.date = expense.date.toISOString().slice(0, 10);

                            expense.category = {
                                id: expense.category_id,
                                name: expense.category_name
                            }
                        });

                        resolve(results.rows);
                    }
                );
            });
        },

        categories(parent, args, context, info) {
            return new Promise((resolve, reject) => {
                pool.query(`
                    SELECT id, name
                    FROM categories
                    WHERE user_id = 0 
                    ORDER BY name`, 
                    (error, results) => {

                        if (error) { reject(error); }

                        resolve(results.rows);
                    }
                );
            });
        }
    },

    Mutation: {
        addExpense(parent, args, context, info) {
            return new Promise((resolve, reject) => {
                pool.query(`
                    INSERT INTO expenses (title, sum, date, category) 
                    VALUES ($1, $2, $3, $4) 
                    RETURNING (id, title, date, sum, category)`,
                    [args.title, args.sum.replace(/,/g, "."), args.date, args.category],
                    (error, result) => {
                        if (error) { reject(error); }

                        const returnedValues = result.rows[0].row
                            .replace(/([ ( ) ])/g, "")
                            .split(",");

                        resolve({
                            id: returnedValues[0],
                            title: returnedValues[1],
                            date: returnedValues[2],
                            sum: returnedValues[3],
                            category: {
                                id: returnedValues[4],
                                name: ""
                            }
                        });
                    }
                );
            });
        },

        updateExpense(parent, args, context, info) {
            return new Promise((resolve, reject) => {
                pool.query(`
                    UPDATE expenses 
                    SET title = $1, sum = $2, date = $3, category = $4 
                    WHERE id = $5 
                    RETURNING (id, title, date, sum, category)`,
                    [args.title, args.sum.replace(/,/g, "."), args.date, args.category, args.id],
                    (error, result) => {
                        if (error) { reject(error); }

                        const returnedValues = result.rows[0].row
                            .replace(/([ ( ) ])/g, "")
                            .split(",");

                        resolve({
                            id: returnedValues[0],
                            title: returnedValues[1],
                            date: returnedValues[2],
                            sum: returnedValues[3],
                            category: {
                                id: returnedValues[4],
                                name: ""
                            }
                        });
                    }
                );
            });
        },

        deleteExpense(parent, args, context, info) {
            return new Promise((resolve, reject) => {
                pool.query(
                    "DELETE FROM expenses WHERE id = $1", 
                    [args.id], 
                    (error) => {
                        if (error) { reject(error); }

                        resolve();
                    }
                );
            });
        }
    }
};

module.exports = { typeDefs, resolvers };