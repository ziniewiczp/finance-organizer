import React, { useState, useEffect } from "react";
import callServer from "./services/ExpensesService";
import AddEditExpenseModal from "./components/AddEditExpenseModal";

const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const App = () => {
    const [categories, setCategories] = useState([]);

    const [expenses, setExpenses] = useState([]);

    const [currentMonthTotal, setCurrentMonthTotal] = useState(0);

    const [currentMonth, setCurrentMonth] = useState(months[new Date().getMonth()]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const [editedExpense, setEditedExpense] = useState();
    const [showAddEditModal, setShowAddEditModal] = useState(false);

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

    const getCategories = () => {
        callServer(`{ categories { id name } }`)
            .then((response) => {
                setCategories(response.data.data.categories);
            });
    };

    const getExpenses = (month = months.indexOf(currentMonth), year = currentYear) => {
        callServer(`{ expenses( month: ${month + 1}, year: ${year} ) { id title sum date category { id name } } }`)
            .then((response) => {
                handleExpensesUpdate(response.data.data.expenses);
            });
    };

    const addExpense = (providedExpense) => {
        callServer(`mutation { 
                addExpense(
                    title: "${providedExpense.title}", 
                    sum: "${providedExpense.sum}", 
                    date: "${providedExpense.date}",
                    category: "${providedExpense.category}"
                ) { id title sum date category { id name } } 
            }`)
            .then((response) => {
                const newExpense = response.data.data.addExpense;
                newExpense.category.name = categories[newExpense.category.id - 1].name;

                const newExpenseDate = new Date(newExpense.date);
                if(newExpenseDate.getMonth() !== months.indexOf(currentMonth)) {
                    setCurrentMonth(months[newExpenseDate.getMonth()]);
                }

                if(newExpenseDate.getFullYear() !== currentYear) {
                    setCurrentYear(newExpenseDate.getFullYear());
                }

                handleExpensesUpdate(
                    expenses
                        .concat(newExpense)
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                );
            });

        handleAddEditModalClose();
    };

    const editExpense = (providedExpense) => {
        callServer(`mutation { 
                updateExpense(
                    id: "${providedExpense.id}", 
                    title: "${providedExpense.title}", 
                    sum: "${providedExpense.sum}",
                    date: "${providedExpense.date}",
                    category: "${providedExpense.category}"
                ) { id title sum date category { id name } } 
            }`)
            .then((response) => {
                const editedExpense = response.data.data.updateExpense;
                const editedExpenseDate = new Date(editedExpense.date);

                const monthMatches = editedExpenseDate.getMonth() === months.indexOf(currentMonth);
                const yearMatches = editedExpenseDate.getFullYear() === currentYear;

                if(monthMatches && yearMatches) {
                    editedExpense.category.name = categories[editedExpense.category.id - 1].name;

                    handleExpensesUpdate(
                        expenses.map((expense) => {
                            if(expense.id === editedExpense.id) {
                                expense.title = editedExpense.title;
                                expense.sum = editedExpense.sum;
                                expense.date = editedExpenseDate.toISOString().slice(0, 10);
                                expense.category.id = editedExpense.category.id;
                                expense.category.name = editedExpense.category.name;
                            }
        
                            return expense;

                        }).sort((a, b) => new Date(a.date) - new Date(b.date))
                    );
                
                } else {
                    setCurrentYear(editedExpenseDate.getFullYear());
                    if(currentMonth !== months[editedExpenseDate.getMonth()]) {
                        setCurrentMonth(months[editedExpenseDate.getMonth()]);
                    
                    } else {
                        getExpenses(editedExpenseDate.getMonth(), editedExpenseDate.getFullYear());
                    }
                }
            });

        handleAddEditModalClose();
    }

    const deleteExpense = (id) => {
        callServer(`mutation { deleteExpense(id: ${id}) { id } }`)
            .then(() => {
                handleExpensesUpdate(expenses.filter(expense => expense.id !== id));
            });
    }

    const saveModalData = (expense) => {
        (expense.id) ? editExpense(expense) : addExpense(expense);
    }
    
    const displayAddEditModal = (expense = null) => {
        setEditedExpense(expense);
        setShowAddEditModal(true);
    }
    
    const handleAddEditModalClose = () => {
        setShowAddEditModal(false);
        setEditedExpense(null);
    }

    const handleExpensesUpdate = (updatedExpenses) => {
        setExpenses(updatedExpenses);
        setCurrentMonthTotal(
            updatedExpenses.reduce((acc, current) => acc + Number(current.sum), 0)
        );
    }

    useEffect(getCategories, []);
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
                        <th>Category</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th>Sum</th>
                        <th colSpan="2"></th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{expense.id}</td>
                                <td>{expense.category.name}</td>
                                <td>{expense.date}</td>
                                <td>{expense.title}</td>
                                <td>{expense.sum}</td>
                                <td><button onClick={() => displayAddEditModal(expense)}>Edit</button></td>
                                <td><button onClick={() => deleteExpense(expense.id)}>Delete</button></td>
                            </tr>
                        )
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td>Total</td>
                        <td colSpan="3"></td>
                        <td>{currentMonthTotal.toFixed(2)}</td>
                        <td colSpan="2"></td>
                    </tr>
                </tfoot>
            </table>

            <button onClick={() => displayAddEditModal()}>Add new expense</button>

            <AddEditExpenseModal 
                show={showAddEditModal}
                expense={editedExpense}
                categories={categories}
                handleClose={handleAddEditModalClose}
                handleSave={saveModalData}
            />
        </div>
    );
}

export default App;