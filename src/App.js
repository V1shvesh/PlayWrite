import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

import './App.css';

import Node from './components/Node';
import Head from './components/Head';
import Write from './components/Write';

const [PLAY, CODE] = [0, 1];

/*
TODO:
  Add eventhandler to Run Button
  Add interpreter in eventHandler
*/

function addrFromId(id) {
  let num;
  if (typeof id === 'string') {
    if (id === 'node-head') return 'node-head';
    num = id.split('-').pop();
  } else { num = id; }
  return `${num.toString().padStart(2, '0')}`;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      curValueInput: NaN,
      curAddrInput: '',
      editorText: '',
      head: false,
      mode: PLAY,
    };
    jsPlumb.ready(() => {
      jsPlumb.setContainer('App');
      jsPlumb.bind('beforeDrop', (e) => {
        const { editorText, mode } = this.state;
        if (mode === PLAY) {
          const sourceUid = addrFromId(e.sourceId);
          const targetUid = addrFromId(e.targetId);
          this.setState({
            editorText: `${editorText}Linked node-${sourceUid} node-${targetUid}\n`,
          });
        }
        return true;
      });
      jsPlumb.bind('beforeDetach', (e) => {
        const { editorText, mode } = this.state;
        if (mode === PLAY) {
          this.setState({
            editorText: `${editorText}Unlinked node-${addrFromId(e.sourceId)} node-${addrFromId(e.targetId)}\n`,
          });
        }
        return true;
      });
    });
  }

  addHead = () => {
    const { editorText, mode } = this.state;
    this.setState({
      head: true,
    });

    if (mode === PLAY) {
      this.setState({
        editorText: `${editorText}Created HEAD\n`,
      });
    }
  }

  removeHead = () => {
    const { head, mode, editorText } = this.state;
    if (head) {
      const endpoint = jsPlumb.selectEndpoints({ source: 'node-head' });
      endpoint.delete();
      this.setState({ head: false });
      if (mode === PLAY) {
        this.setState({
          editorText: `${editorText}Removed HEAD\n`,
        });
      }
    }
  }

  addNode = (val) => {
    const {
      nodes,
      editorText,
      mode,
    } = this.state;
    if (Number.isNaN(val)) {
      return -1;
    }

    let uid = 0;
    do {
      uid = Math.floor(Math.random() * 100);
    } while (nodes.map(node => node.uid).includes(uid));

    this.setState({
      nodes: [
        ...nodes,
        {
          data: val,
          uid,
          next: null,
        },
      ],
    });

    if (mode === PLAY) {
      this.setState({
        editorText: `${editorText}Created node at ${addrFromId(uid)}\n`,
      });
    }
    return uid;
  }

  removeNode = (uid) => {
    const { nodes, mode, editorText } = this.state;
    const addr = addrFromId(uid);
    if (nodes.map(val => val.uid).includes(uid)) {
      const endpoints = jsPlumb.selectEndpoints({ element: `node-${addr}` });
      endpoints.delete();
      const newNodes = nodes.filter(val => val.uid !== uid);
      this.setState({
        nodes: newNodes,
      });

      if (mode === PLAY) {
        this.setState({
          editorText: `${editorText}Removed node at ${addrFromId(uid)}\n`,
        });
      }
    }
  }

  linkNodes = (sourceUid, targetUid) => {
    jsPlumb.connect({
      source: `node-${sourceUid}`,
      target: `node-${targetUid}`,
    });
  }

  unlinkNodes = (sourceUid, targetUid) => {
    jsPlumb.selectConnections({
      source: `node-${sourceUid}`,
      target: `node-${targetUid}`,
    }).delete();
  }

  handleValueInput = (e) => {
    const { valueAsNumber } = e.target;
    let a = valueAsNumber;
    if (Number.isNaN(a)) {
      a = NaN;
    }
    if (a >= 1000) {
      a = 999;
    } else if (a < 0) {
      a = 0;
    }
    this.setState({
      curValueInput: a,
    });
  }

  handleAddrInput = (e) => {
    const { valueAsNumber } = e.target;
    this.setState({
      curAddrInput: valueAsNumber,
    });
  }

  handleEditorTextInput = (e) => {
    const { value } = e.target;
    this.setState({
      editorText: value,
    });
  }

  changeMode = () => {
    const { mode } = this.state;
    this.removeHead();
    this.setState({
      mode: 1 - mode,
      curValueInput: NaN,
      editorText: '',
    });
  }

  runCode = () => {
    // Interpreter
    const { editorText } = this.state;
    const instructions = editorText.split('\n').map(line => line.trim()).filter(line => line.match(/\S+/));

    console.log(instructions);
  }

  render() {
    const {
      nodes,
      curValueInput,
      curAddrInput,
      editorText,
      head,
      mode,
    } = this.state;
    const nodeList = nodes.map(node => <Node key={node.uid} data={node.data} addr={node.uid} />);
    return (
      <div id="App" className="App">
        {/* PlayArea */}
        <div id="play-area" className="play-grid">
          {head ? <Head /> : ''}
          {nodeList}
        </div>
        {/* WriteArea */}
        <div className="write-area">
          <div className="mode">
            <button
              type="button"
              className="btn btn-play"
              onClick={this.changeMode}
              disabled={mode === PLAY}
            >
              Play
            </button>
            <button
              type="button"
              className="btn btn-code"
              onClick={this.changeMode}
              disabled={mode === CODE}
            >
              Code
            </button>
          </div>
          <Write input={editorText} mode={mode} handleChange={this.handleEditorTextInput} />
        </div>
        {/* TaskBar */}
        { mode === PLAY
          ? (
            <div className="taskbar">
              <input
                className="node-val"
                type="number"
                min="0"
                max="999"
                value={Number.isNaN(curValueInput) ? '' : curValueInput}
                onChange={this.handleValueInput}
              />
              <button
                className="btn btn-create-node"
                type="button"
                onClick={() => this.addNode(curValueInput)}
              >
                Create Node
              </button>
              <button
                className="btn btn-create-head"
                type="button"
                disabled={head}
                onClick={this.addHead}
              >
                Create Head
              </button>
              <input
                className="node-addr"
                type="number"
                min="0"
                max="99"
                value={curAddrInput}
                onChange={this.handleAddrInput}
              />
              <button
                className="btn btn-create-node"
                type="button"
                onClick={() => this.removeNode(curAddrInput)}
              >
                Remove Node
              </button>
            </div>
          ) : (
            <div className="taskbar">
              <button
                className="btn btn-run-code"
                type="button"
                onClick={this.runCode}
              >
                Run
              </button>
            </div>
          )
        }
      </div>
    );
  }
}

export default App;
