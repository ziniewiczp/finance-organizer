import React, { useState, useEffect } from "react";
import callServer from "./services/ExpensesService";
import EditExpenseModal from "./components/EditExpenseModal"
import AddExpenseModal from "./components/AddExpenseModal";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const App = () => {
    const [expenses, setExpenses] = useState([]);

    const [currentMonthTotal, setCurrentMonthTotal] = useState(0);

    const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [showAddModal, setShowAddModal] = useState(false);

    const [editedExpense, setEditedExpense] = useState();
    const [showEditModal, setShowEditModal] = useState(false);

    const changeMonth = (direction) => {
        let nextMonth = months.indexOf(currentMonth) + direction;
        if(nextMonth === 12) { 
            nextMonth = 0;
            setCurrentYear(currentYear + 1)
        }
        
        if(nextMonth === -1) { 
            nextMonth = 11;
            setCurrentYear(currentYear - 1);
        }
        
        setCurrentMonth(months[nextMonth]);
    }

    const getExpenses = () => {
        callServer(`{ expenses( month: ${months.indexOf(currentMonth) + 1} ) { id title sum date } }`)
            .then((response) => {
                handleExpensesUpdate(response.data.data.expenses);
            });
    };

    const addExpense = (providedExpense) => {
        callServer(`mutation { 
                addExpense(
                    title: "${providedExpense.title}", 
                    sum: "${providedExpense.sum}", 
                    date: "${providedExpense.date}"
                ) { id title sum date } 
            }`)
            .then((response) => {
                const newExpenseDate = new Date(providedExpense.date);
                if(newExpenseDate.getMonth() !== months.indexOf(currentMonth)) {
                    setCurrentMonth(months[newExpenseDate.getMonth()]);
                }

                if(newExpenseDate.getFullYear() !== currentYear) {
                    setCurrentYear(newExpenseDate.getFullYear());
                }

                const updatedExpenses = expenses
                    .concat(response.data.data.addExpense)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));
                handleExpensesUpdate(updatedExpenses);
            });

        handleAddModalClose();
    };

    const editExpense = (providedExpense) => {
        callServer(`mutation { 
                updateExpense(
                    id: "${providedExpense.id}", 
                    title: "${providedExpense.title}", 
                    sum: "${providedExpense.sum}",
                    date: "${providedExpense.date}"
                ) { id title sum date } 
            }`)
            .then(() => {
                handleExpensesUpdate(expenses.map((expense) => {
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
                handleExpensesUpdate(expenses.filter(expense => expense.id !== id));
            });
    }

    const displayAddModal = () => {
        setShowAddModal(true);
    }
    
    const displayEditModal = (expense) => {
        setEditedExpense(expense);
        setShowEditModal(true);
    }

    const handleAddModalClose = () => {
        setShowAddModal(false);
    }
    
    const handleEditModalClose = () => {
        setShowEditModal(false);
        setEditedExpense(null);
    }

    const handleExpensesUpdate = (updatedExpenses) => {
        setExpenses(updatedExpenses);
        setCurrentMonthTotal(
            updatedExpenses.reduce((acc, current) => acc + Number(current.sum), 0)
        );
    }

    useEffect(getExpenses, [currentMonth]);

    return (
        <div>
            <div>
                <button onClick={ () => changeMonth(-1) }>&lt;</button>
                <span style={{ margin: "2rem" }}>{`${currentMonth} ${currentYear}` }</span>
                <button onClick={ () => changeMonth(1) }>&gt;</button>
            </div>
            <table style={{ margin: "1rem" }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Sum</th>
                        <th colspan="2"></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{expense.id}</td>
                                <td>{expense.date}</td>
                                <td>{expense.title}</td>
                                <td>{expense.sum}</td>
                                <td><button onClick={() => displayEditModal(expense)}>Edit</button></td>
                                <td><button onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                            </tr>
                        )
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Total</td>
                        <td colspan="2"></td>
                        <td>{currentMonthTotal.toFixed(2)}</td>
                        <td colspan="2"></td>
                    </tr>
                </tfoot>
            </table>

            <button onClick={() => displayAddModal()}>Add new expense</button>

            <EditExpenseModal 
                show={showEditModal}
                expense={editedExpense}
                handleClose={handleEditModalClose}
                handleEdit={editExpense}
            />

            <AddExpenseModal
                show={showAddModal}
                handleClose={handleAddModalClose}
                handleAdd={addExpense}
            />
        </div>
    );
}

export default App;