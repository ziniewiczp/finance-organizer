import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const AddEditExpenseModal = ({ show, expense, handleClose, handleSave }) => {
    const [newTitle, setNewTitle] = useState("");
    const [newSum, setNewSum] = useState("");
    const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

    const handleNewTitleChange = (event) => {
        setNewTitle(event.target.value);
    }

    const handleNewSumChange = (event) => {
        setNewSum(event.target.value);
    }
    
    const handleNewDateChange = (event) => {
        setNewDate(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSave({
            id : (expense) ? expense.id : null,
            title : newTitle,
            sum : newSum,
            date : newDate
        });
    }

    const handleShowChange = () => {
        if(expense) {
            setNewTitle(expense.title);
            setNewSum(expense.sum);
            setNewDate(expense.date);
        }
    }

    useEffect(handleShowChange, [show]);

    return (
        <div>
            <Modal show={show} handleClose={handleClose}>
                <p>Edit expense:</p>
                <form onSubmit={handleSubmit} style={{ margin: "1rem" }}>
                    <input
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
                    <button style={{ margin: "0.2rem" }} type="submit">
                        Save
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AddEditExpenseModal;

