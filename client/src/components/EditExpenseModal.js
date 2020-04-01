import React, { useState, useEffect } from "react";
import Modal from "./Modal";

const EditExpenseModal = ({ show, expense, handleClose, handleEdit }) => {
    const [newTitle, setNewTitle] = useState("");
    const [newSum, setNewSum] = useState("");

    const handleNewTitleChange = (event) => {
        setNewTitle(event.target.value);
    }

    const handleNewSumChange = (event) => {
        setNewSum(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        handleEdit({
            id : expense.id,
            title : newTitle,
            sum : newSum
        });
    }

    const handleShowChange = () => {
        if(expense) {
            setNewTitle(expense.title);
            setNewSum(expense.sum);
        }
    }

    useEffect(handleShowChange, [show]);

    return (
        <div>
            <Modal show={show} handleClose={handleClose}>
                <p>Edit expense:</p>
                <form onSubmit={handleSubmit} style={{ margin: "1rem" }}>
                    <input
                        value={newTitle}
                        onChange={handleNewTitleChange}
                        style={{ width: '200px' }}
                    />
                    <input
                        value={newSum}
                        onChange={handleNewSumChange}
                        style={{ width: "100px", margin: "0.2rem" }}
                    />
                    <button style={{ margin: "0.2rem" }} type="submit">
                        Edit
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default EditExpenseModal;

