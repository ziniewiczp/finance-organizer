import React, { useState, useEffect } from "react";
import callServer from "./services/ExpensesService";
import Modal from "./components/Modal"

const App = () => {
    const [expenses, setExpenses] = useState();

    const [newExpenseTitle, setNewExpenseTitle] = useState();
    const [newExpenseSum, setNewExpenseSum] = useState();

    const [editedExpenseId, setEditedExpenseId] = useState();
    const [editedExpenseTitle, setEditedExpenseTitle] = useState();
    const [editedExpenseSum, setEditedExpenseSum] = useState();

    const [showEditModal, setShowEditModal] = useState(false);

    const getExpenses = () => {
        callServer(`{ expenses { id title sum } }`)
            .then((response) => setExpenses(response.data.data.expenses));
    };

    const addExpense = (event) => {
        event.preventDefault();
        callServer(`mutation { addExpense(title: "${newExpenseTitle}", sum: "${newExpenseSum}") { title sum } }`)
            .then(() => {
                // TODO: find out if it's possible to return newly created object
                setExpenses(expenses.concat({ title: newExpenseTitle, sum: newExpenseSum }));

                setNewExpenseTitle("");
                setNewExpenseSum("");
            });
    };

    const editExpense = (event) => {
        event.preventDefault();
        callServer(`mutation { updateExpense(id: "${editedExpenseId}", title: "${editedExpenseTitle}", sum: "${editedExpenseSum}") { id title sum } }`)
            .then(() => {
                setExpenses(expenses.map((expense) => {
                    if(expense.id === editedExpenseId) {
                        expense.title = editedExpenseTitle;
                        expense.sum = editedExpenseSum;
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
        setEditedExpenseId(expense.id);
        setEditedExpenseTitle(expense.title);
        setEditedExpenseSum(expense.sum);
        setShowEditModal(true);
    }
    
    const handleEditModalClose = () => {
        setShowEditModal(false);
        setEditedExpenseTitle("");
        setEditedExpenseSum("");
    }

    const handleNewExpensTitleChange = (event) => {
        setNewExpenseTitle(event.target.value);
    }

    const handleNewExpensSumChange = (event) => {
        setNewExpenseSum(event.target.value);
    }

    const handleEditedExpensTitleChange = (event) => {
        setEditedExpenseTitle(event.target.value);
    }

    const handleEditedExpensSumChange = (event) => {
        setEditedExpenseSum(event.target.value);
    }

    useEffect(getExpenses, []);

    return (
        <div>
            <table style={{ margin: "1rem" }}>
                <thead>
                    <tr>
                        <th>ID</th>
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
                    onChange={handleNewExpensTitleChange}
                    style={{ width: '200px' }}
                />
                <input
                    placeholder="Sum..."
                    value={newExpenseSum}
                    onChange={handleNewExpensSumChange}
                    style={{ width: '100px', margin: "0.2rem" }}
                />
                <button style={{ margin: "0.2rem" }} type="submit">
                    Add
                </button>
            </form>

            <Modal show={showEditModal} handleClose={handleEditModalClose}>
                <p>Edit expense:</p>
                <form onSubmit={editExpense} style={{ margin: "1rem" }}>
                    <input
                        value={editedExpenseTitle}
                        onChange={handleEditedExpensTitleChange}
                        style={{ width: '200px' }}
                    />
                    <input
                        value={editedExpenseSum}
                        onChange={handleEditedExpensSumChange}
                        style={{ width: "100px", margin: "0.2rem" }}
                    />
                    <button style={{ margin: "0.2rem" }} type="submit">
                        Edit
                    </button>
                </form>
            </Modal>
        </div>
    );
}

export default App;