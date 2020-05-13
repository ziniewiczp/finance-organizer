import React, { useState, useEffect } from "react";
import callServer from "../services/ExpensesService";
import Modal from "./Modal";

const AddEditExpenseModal = ({ show, expense, categories, handleClose, handleSave }) => {
    const [newTitle, setNewTitle] = useState("");
    const [newSum, setNewSum] = useState("");
    const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
    const [newCategory, setNewCategory] = useState(0);

    const handleNewTitleChange = (event) => {
        setNewTitle(event.target.value);
    }

    const handleNewSumChange = (event) => {
        setNewSum(event.target.value);
    }
    
    const handleNewDateChange = (event) => {
        setNewDate(event.target.value);
    }

    const handleNewCategoryChange = (event) => {
        setNewCategory(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        handleSave({
            id : (expense) ? expense.id : null,
            title : newTitle,
            sum : newSum,
            date : newDate,
            category : newCategory
        });
    }

    const handleShowChange = () => {
        if(show) {
            document.getElementById("newTitleInputField").focus();
            
            if(expense) {
                setNewTitle(expense.title);
                setNewSum(expense.sum);
                setNewDate(expense.date);
                setNewCategory(expense.category.id);
            }
        
        } else {
            setNewTitle("");
            setNewSum("");
            setNewDate(new Date().toISOString().slice(0, 10));
            setNewCategory(0);
        }
    }

    useEffect(handleShowChange, [show]);

    return (
        <div>
            <Modal show={show} handleClose={handleClose}>
                <p>Edit expense:</p>
                <form onSubmit={handleSubmit} style={{ margin: "1rem" }}>
                    <input
                        id="newTitleInputField"
                        placeholder="Title..."
                        value={newTitle}
                        onChange={handleNewTitleChange}
                        style={{ width: '200px' }}
                    />
                    <input
                        placeholder="Sum..."
                        value={newSum}
                        onChange={handleNewSumChange}
                        style={{ width: "100px", margin: "0.2rem" }}
                    />
                    <input
                        type="date"
                        value={newDate}
                        onChange={handleNewDateChange}
                        style={{ width: '200px', margin: "0.2rem" }}
                    />
                    <select onChange={handleNewCategoryChange} value={newCategory}>
                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}>

                                {category.name}
                            </option>
                            )
                        )}
                    </select>
                    <button style={{ margin: "0.2rem" }} type="submit">
                        Save
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AddEditExpenseModal;

