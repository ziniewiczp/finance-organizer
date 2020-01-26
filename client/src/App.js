import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
    state = {
        data: [],
        id: 0,
        message: null,
        intervalIsSet: false,
        idToDelete: null,
        idToUpdate: null,
        objectToUpdate: null,
        showEditModal : false,
    };

    componentDidMount() {
        this.getDataFromDb();
        if (!this.state.intervalIsSet) {
            let interval = setInterval(this.getDataFromDb, 1000);
            this.setState({ intervalIsSet: interval });
        }
    }

    componentWillUnmount() {
        if (this.state.intervalIsSet) {
            clearInterval(this.state.intervalIsSet);
            this.setState({ intervalIsSet: null });
        }
    }

    getDataFromDb = () => {
        axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `{ expenses { id title sum } }` }
        }).then((result) => {
            this.setState({ data: result.data.data.expenses });
        });
    };

    putDataToDB = (title, sum) => {
        axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `mutation { addExpense(title: "${title}", sum: "${sum}") { title sum } }` }
        });

        // TODO: clear the fields
        // TODO: add button -> modal (?)
    };

    showEditModal = (id, title, sum) => {
        this.setState({ showEditModal: true, idToUpdate: id, title: title, sum: sum });
    };

    hideEditModal = () => {
        this.setState({ showEditModal: false });
    };

    updateDataInDB = (id, title, sum) => {
        this.hideEditModal();

        axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `mutation { updateExpense(id: "${id}", title: "${title}", sum: "${sum}") { id title sum } }` }
        });
    };

    deleteFromDB = (id) => {
        axios({
            url: "http://localhost:3002/graphql",
            method: "post",
            data: { query: `mutation { deleteExpense(id: ${id}) { id } }` }
        });
    };

    render() {
        const { data } = this.state;
        return (
            <div>
                <table style={{ margin: "1rem" }}>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Sum</th>
                        <th></th>
                    </tr>
                    {!data
                        ? 'No expenses added.'
                        : data.map((dat) => (
                            <tr>
                                <td>{dat.id}</td>
                                <td>{dat.title}</td>
                                <td>{dat.sum}</td>
                                <td><button onClick={ () => this.showEditModal(dat.id, dat.title, dat.sum) }>Edit</button></td>
                                <td><button onClick={ () => this.deleteFromDB(dat.id) }>Delete</button></td>
                            </tr>
                        ))}
                </table>
                <div style={{ margin: "1rem" }}>
                    <input
                        type="text"
                        onChange={(e) => this.setState({ title: e.target.value })}
                        placeholder="Title..."
                        style={{ width: '200px' }}
                    />
                    <input
                        style={{ margin: "0.2rem" }}
                        type="text"
                        onChange={(e) => this.setState({ sum: e.target.value })}
                        placeholder="Sum..."
                        style={{ width: '100px' }}
                    />
                    <button style={{ margin: "0.2rem" }} onClick={() => this.putDataToDB(this.state.title, this.state.sum)}>
                        Add
                    </button>
                </div>

                <Modal show={this.state.showEditModal} handleClose={this.hideEditModal}>
                    <p>Edit expense:</p>
                    <div style={{ margin: "1rem" }}>
                    <input
                        type="text"
                        onChange={(e) => this.setState({ title: e.target.value })}
                        defaultValue={this.state.title}
                        style={{ width: '200px' }}
                    />
                    <input
                        style={{ margin: "0.2rem" }}
                        type="text"
                        onChange={(e) => this.setState({ sum: e.target.value })}
                        defaultValue={this.state.sum}
                        style={{ width: '100px' }}
                    />
                    <button style={{ margin: "0.2rem" }} onClick={() => this.updateDataInDB(this.state.idToUpdate, this.state.title, this.state.sum)}>
                        Edit
                    </button>
                </div>
                </Modal>    
            </div >
        );
    }
}

const Modal = ({ handleClose, show, children }) => {
    const showHideClassName = show ? 'modal display-block' : 'modal display-none';
  
    return (
      <div className={showHideClassName}>
        <section className='modal-main'>
          {children}
          <button
            onClick={handleClose}
          >
            Close
          </button>
        </section>
      </div>
    );
  };

export default App;