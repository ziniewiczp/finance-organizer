const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const getExpenses = (request, response) => {
    pool.query("SELECT * FROM expenses", (error, results) => {
        if(error) { 
            return response.json({ success: false, data: error });
        }
        
        return response.json({ success: true, data: results.rows });
    });
}

const addExpense = (request, response) => {
    const { title, sum } = request.body;

    pool.query("INSERT INTO expenses (title, sum) VALUES ($1, $2)", [title, sum], error => {
        if(error) { 
            return response.json({ success: false, data: error });
        }
        
        return response.json({ success: true, message: "Expense added." });
    });
}

const deleteExpense = (request, response) => {
    const id = request.params.id;

    pool.query("DELETE FROM expenses WHERE id = $1", [id], (error, results) => {
        if(error) {
            return response.json({ success: false, data: error });
        }
        
        return response.json({ success: true, message: "Expense deleted." });
    });
}

app.get("/expenses", getExpenses)
    .post("/expenses", addExpense)
    .delete("/expenses/:id", deleteExpense);

app.listen((process.env.PORT || 3002), () => {
    console.log("Server listening");
});