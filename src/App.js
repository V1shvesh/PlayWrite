import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

import './App.css';

import Node from './components/Node';
import Head from './components/Head';
import Write from './components/Write';

const [PLAY, CODE] = [0, 1];

/*
TODO:
  Add interpreter in eventHandler
*/

function addrFromId(id) {
  let num;
  if (typeof id === 'string') {
    if (id === 'node-head') return 'head';
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
      mode: CODE,
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

  addEndpoint = (id, options) => {
    jsPlumb.addEndpoint(id, options);
  }

  makeDraggable = (id) => {
    jsPlumb.draggable(id, { containment: 'parent' });
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
    return 'head';
  }

  removeHead = () => {
    const { head, mode, editorText } = this.state;
    if (head) {
      const endpoints = jsPlumb.selectEndpoints({ source: 'node-head' });
      endpoints.delete();
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

    this.setState(state => ({
      nodes: [
        ...state.nodes,
        {
          data: val,
          uid,
          next: null,
        },
      ],
    }));

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
    const sourceId = `node-${addrFromId(sourceUid)}`;
    const targetId = `node-${addrFromId(targetUid)}`;
    const sourceEndpoint = jsPlumb.selectEndpoints({ source: sourceId }).get(0);
    const targetEndpoint = jsPlumb.selectEndpoints({ target: targetId }).get(0);
    console.log(sourceEndpoint, targetEndpoint);
    jsPlumb.connect({
      source: sourceEndpoint,
      target: targetEndpoint,
    });
  }

  unlinkNodes = (sourceUid, targetUid) => {
    jsPlumb.selectConnections({
      source: `node-${addrFromId(sourceUid)}`,
      target: `node-${addrFromId(targetUid)}`,
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

  resetPlayArea = () => {
    jsPlumb.selectEndpoints().delete();
    this.setState({
      nodes: [],
      curValueInput: NaN,
      curAddrInput: '',
      head: false,
    });
  }

  changeMode = () => {
    const { mode } = this.state;
    this.resetPlayArea();
    this.setState({
      mode: 1 - mode,
      editorText: '',
    });
  }

  runCode = () => {
    //  !INTERPRETER!
    this.resetPlayArea();
    const { editorText } = this.state;
    const varStore = {};
    const instructions = editorText.split('\n').filter(line => line.match(/\S+/)).map(line => line.trim().split(' '));
    let curIndex = 0;
    let curTimeout = 0;
    try {
      while (curIndex < instructions.length) {
        const curLine = instructions[curIndex];
        if (curLine[1] === '=') {
          // Assignments
          switch (curLine[2]) {
            case 'Node':
              setTimeout(() => {
                varStore[curLine[0]] = this.addNode(parseInt(curLine[3], 10));
              }, curTimeout);
              break;
            case 'Head':
              setTimeout(() => {
                varStore[curLine[0]] = this.addHead();
              }, curTimeout);
              break;
            default:
              setTimeout(() => {
                // Error if value undefined
                varStore[curLine[0]] = varStore[curLine[1]];
              }, curTimeout);
              break;
          }
        } else {
          // Functions
          switch (curLine[0]) {
            case 'Link':
              setTimeout(() => {
                this.linkNodes(varStore[curLine[1]], varStore[curLine[2]]);
              }, curTimeout);
              break;

            case 'Remove':
              setTimeout(() => {
                if (varStore[curLine[1]] === 'head') {
                  this.removeHead();
                } else {
                  this.removeNode(varStore[curLine[1]]);
                }
              }, curTimeout);
              break;

            default:
              break;
          }
        }
        curIndex += 1;
        curTimeout += 1000;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
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
    const nodeList = nodes.map(node => (
      <Node
        key={node.uid}
        data={node.data}
        addr={node.uid}
        addEndpoint={this.addEndpoint}
        makeDraggable={this.makeDraggable}
      />
    ));
    return (
      <div id="App" className="App">
        {/* PlayArea */}
        <div id="play-area" className="play-grid">
          {head ? <Head addEndpoint={this.addEndpoint} makeDraggable={this.makeDraggable} /> : ''}
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
