import React, { useState, useEffect } from "react";
import Axios from "axios";
// import Modal from "./components/Modal"

const App = () => {
    const [expenses, setExpenses] = useState();
    const [newExpenseTitle, setNewExpenseTitle] = useState();
    const [newExpenseSum, setNewExpenseSum] = useState();

    const getExpenses = () => {
        Axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `{ expenses { id title sum } }` }
        }).then((response) => {
            setExpenses(response.data.data.expenses);
        });
    };

    useEffect(getExpenses, []);

    const addExpense = (event) => {
        // TODO: add form validation
        event.preventDefault();
        Axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `mutation { addExpense(title: "${newExpenseTitle}", sum: "${newExpenseSum}") { title sum } }` }
        }).then(response => {
            // TODO: find out if it's possible to return newly created object
            setExpenses(expenses.concat({ title: newExpenseTitle, sum: newExpenseSum }));

            setNewExpenseTitle("");
            setNewExpenseSum("");
        });
    };

    const handleNewExpensTitleChange = (event) => {
        setNewExpenseTitle(event.target.value);
    }

    const handleNewExpensSumChange = (event) => {
        setNewExpenseSum(event.target.value);
    }

    const deleteExpense = (id) => {
        Axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `mutation { deleteExpense(id: ${id}) { id } }` }
        }).then(() => {
            setExpenses(expenses.filter(expense => expense.id !== id));
        });
    }

    //     showEditModal = (item) => {
    //         this.setState({ showEditModal: true, idToUpdate: item.id, titleToUpdate: item.title, sumToUpdate: item.sum }, () => {
    //             document.getElementById("editTitleInput").value = item.title;
    //             document.getElementById("editSumInput").value = item.sum;
    //         });
    //     };

    //     hideEditModal = () => {        
    //         this.setState({ showEditModal: false });
    //     };

    //     updateDataInDB = (id, title, sum) => {
    //         axios({
    //             url: "http://localhost:3002/graphql",
    //             method: "post",
    //             data: { query: `mutation { updateExpense(id: "${id}", title: "${title}", sum: "${sum}") { id title sum } }` }

    //         }).then(result => {
    //             this.hideEditModal();
    //         });
    //     };

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
                                {/* <td><button onClick={() => this.showEditModal(expense)}>Edit</button></td> */}
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

            {/* <Modal show={this.state.showEditModal} handleClose={this.hideEditModal}>
                <p>Edit expense:</p>
                <div style={{ margin: "1rem" }}>
                    <input
                        id="editTitleInput"
                        type="text"
                        onChange={(e) => this.setState({ titleToUpdate: e.target.value })}
                        style={{ width: '200px' }}
                    />
                    <input
                        id="editSumInput"
                        style={{ margin: "0.2rem" }}
                        type="text"
                        onChange={(e) => this.setState({ sumToUpdate: e.target.value })}
                        style={{ width: '100px' }}
                    />
                    <button style={{ margin: "0.2rem" }} onClick={() => this.updateDataInDB(this.state.idToUpdate, this.state.titleToUpdate, this.state.sumToUpdate)}>
                        Edit
                    </button>
                </div>
            </Modal> */}
        </div>
    );
}

export default App;