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
        fetch('http://localhost:3002/expenses')
            .then((data) => data.json())
            .then((res) => this.setState({ data: res.data }));
    };

    putDataToDB = (title, sum) => {
        const idToBeAdded = (this.state.data) ? this.state.data.length : 0;

        axios.post('http://localhost:3002/expenses', {
            id: idToBeAdded,
            title: title,
            sum: sum
        });
    };

    deleteFromDB = (idToDelete) => {
        axios.delete('http://localhost:3002/expenses/' + idToDelete, {});
    };

    // updateDB = (idToUpdate, updateToApply) => {
    //   let objIdToUpdate = null;
    //   parseInt(idToUpdate);
    //   this.state.data.forEach((dat) => {
    //     if (dat.id == idToUpdate) {
    //       objIdToUpdate = dat._id;
    //     }
    //   });

    //   axios.post('http://localhost:3001/api/updateData', {
    //     id: objIdToUpdate,
    //     update: { message: updateToApply },
    //   });
    // };

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
                    {!data || data.length <= 0
                        ? 'No expenses added.'
                        : data.map((dat) => (
                            <tr>
                                <td>{dat.id}</td>
                                <td>{dat.title}</td>
                                <td>{dat.sum}</td>
                                <td><button onClick={() => this.deleteFromDB(dat.id)}>Delete</button></td>
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
            </div >
        );
    }
}

export default App;