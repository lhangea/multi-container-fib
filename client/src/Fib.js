import React, { Component } from "react";
import axios from "axios";
import openSocket from "socket.io-client";

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: ""
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
    const socket = openSocket("http://localhost:3051");
    socket.on("fibComputation", data => {
      if (data.action === "doneCalculating") {
        console.log("done calculating event on client side");
        this.fetchValues();
        this.fetchIndexes();
      }
    });
  }

  async fetchValues() {
    try {
      const values = await axios.get("/api/values/current");
      this.setState({ values: values.data });
    } catch (e) {}
  }

  async fetchIndexes() {
    try {
      const seenIndexes = await axios.get("/api/values/all");
      this.setState({
        seenIndexes: seenIndexes.data
      });
    } catch (e) {}
  }

  handleSubmit = async event => {
    event.preventDefault();

    await axios.post("/api/values", {
      index: this.state.index
    });
    this.setState({ index: "" });
    console.log("handling submit");
  };

  renderSeenIndexes() {
    if (
      this.state.seenIndexes.constructor !== Array ||
      this.state.seenIndexes.length === 0
    ) {
      return "No indexes seen until now";
    }
    return this.state.seenIndexes.map(({ number }) => number).join(", ");
  }

  renderValues() {
    if (this.state.values.constructor !== Object) {
      return "No values";
    }

    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <br />
          <label>Enter your index: </label>
          <input
            value={this.state.index}
            onChange={event => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen: </h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values: </h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
