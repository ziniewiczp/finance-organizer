import React, { useState, useEffect } from "react";
import callServer from "./services/ExpensesService";
import EditExpenseModal from "./components/EditExpenseModal"

const App = () => {
    const [expenses, setExpenses] = useState();

    const [newExpenseTitle, setNewExpenseTitle] = useState();
    const [newExpenseSum, setNewExpenseSum] = useState();
    const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().slice(0, 10));

    const [editedExpense, setEditedExpense] = useState();
    const [showEditModal, setShowEditModal] = useState(false);

    const getExpenses = () => {
        callServer(`{ expenses { id title sum date } }`)
            .then((response) => setExpenses(response.data.data.expenses));
    };

    const addExpense = (event) => {
        event.preventDefault();
        callServer(`mutation { 
                addExpense(
                    title: "${newExpenseTitle}", 
                    sum: "${newExpenseSum}", 
                    date: "${newExpenseDate}"
                ) { id title sum date } 
            }`)
            .then((response) => {
                setExpenses(expenses.concat(response.data.data.addExpense));

                setNewExpenseTitle(null);
                setNewExpenseSum(null);
                setNewExpenseDate(null);
            });
    };

    const editExpense = (providedExpense) => {
        callServer(`mutation { 
                updateExpense(
                    id: "${providedExpense.id}", 
                    title: "${providedExpense.title}", 
                    sum: "${providedExpense.sum}",
                    date: "${providedExpense.date}"
                ) { id title sum } 
            }`)
            .then(() => {
                setExpenses(expenses.map((expense) => {
                    if(expense.id === providedExpense.id) {
                        expense.title = providedExpense.title;
                        expense.sum = providedExpense.sum;
                        expense.date = providedExpense.date;
                    }

                    return expense;
                }));
            });

        handleEditModalClose();
    }

    const deleteExpense = (id) => {
        callServer(`mutation { deleteExpense(id: ${id}) { id } }`)
            .then(() => {
                setExpenses(expenses.filter(expense => expense.id !== id));
            });
    }

    const displayEditModal = (expense) => {
        setEditedExpense(expense);
        setShowEditModal(true);
    }
    
    const handleEditModalClose = () => {
        setShowEditModal(false);
        setEditedExpense(null);
    }

    const handleNewExpenseTitleChange = (event) => {
        setNewExpenseTitle(event.target.value);
    }

    const handleNewExpenseSumChange = (event) => {
        setNewExpenseSum(event.target.value);
    }
    
    const handleNewExpenseDateChange = (event) => {
        setNewExpenseDate(event.target.value);
    }

    useEffect(getExpenses, []);

    return (
        <div>
            <table style={{ margin: "1rem" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Sum</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {!expenses
                        ? 'No expenses added.'
                        : expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{expense.id}</td>
                                <td>{expense.date}</td>
                                <td>{expense.title}</td>
                                <td>{expense.sum}</td>
                                <td><button onClick={() => displayEditModal(expense)}>Edit</button></td>
                                <td><button onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                            </tr>
                        ))}
                </tbody>
            </table>
            <form onSubmit={addExpense} style={{ margin: "1rem" }}>
                <input
                    placeholder="Title..."
                    value={newExpenseTitle}
                    onChange={handleNewExpenseTitleChange}
                    style={{ width: '200px' }}
                />
                <input
                    placeholder="Sum..."
                    value={newExpenseSum}
                    onChange={handleNewExpenseSumChange}
                    style={{ width: '100px', margin: "0.2rem" }}
                />
                <input
                    type="date"
                    value={newExpenseDate}
                    onChange={handleNewExpenseDateChange}
                    style={{ width: '200px', margin: "0.2rem" }}
                />
                <button style={{ margin: "0.2rem" }} type="submit">
                    Add
                </button>
            </form>

            <EditExpenseModal 
                show={showEditModal}
                expense={editedExpense}
                handleClose={handleEditModalClose}
                handleEdit={editExpense}
            />
        </div>
    );
}

export default App;