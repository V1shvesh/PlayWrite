import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

import './App.css';

import Node from './components/Node';
import Head from './components/Head';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      curNodeId: -1,
      curInputValue: 0,
    };
    jsPlumb.ready(() => {
      jsPlumb.setContainer('App');
    });
  }

  addNode = () => {
    const { nodes, curNodeId, curInputValue } = this.state;
    const newNodeId = curNodeId + 1;
    if (Number.isNaN(curInputValue)) {
      return;
    }
    this.setState({
      curNodeId: newNodeId,
      nodes: [
        ...nodes,
        {
          data: curInputValue,
          uid: newNodeId,
        },
      ],
    });
  }

  handleInput = (e) => {
    const { valueAsNumber } = e.target;
    let a = valueAsNumber;
    if (a >= 1000) {
      a = 999;
    }
    if (a < 0) {
      a = 0;
    }
    this.setState({
      curInputValue: a,
    });
  }

  render() {
    const { nodes } = this.state;
    const nodeList = nodes.map(node => <Node key={node.uid} data={node.data} addr={node.uid} />);
    return (
      <div id="App" className="App">
        {/* PlayArea */}
        <div id="play-area" className="play-grid">
          <Head />
          {nodeList}
        </div>
        {/* WriteArea */}
        <div className="write-area">
          Write Area
        </div>
        {/* TaskBar */}
        <div className="taskbar">
          <input
            className="node-val"
            type="number"
            min="0"
            max="999"
            onInput={this.handleInput}
          />
          <button
            type="button"
            className="btn btn-create-node"
            onClick={this.addNode}
          >
            Create Node
          </button>
        </div>
      </div>
    );
  }
}

export default App;
