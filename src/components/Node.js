import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './node.css';
import { jsPlumb } from 'jsplumb';

// TODO: Modify ID to include Data
class Node extends Component {
  constructor(props) {
    super(props);
    this.state = {
      left: (Math.random() * 1000) % 1300,
      top: (Math.random() * 1000) % 300,
    };
  }

  componentDidMount() {
    const { addr } = this.props;
    const sourceEndpoint = {
      anchors: 'Right',
      endpoint: ['Dot', { radius: 8 }],
      connector: ['Straight'],
      connectorOverlays: [['Arrow', { width: 7, length: 7, location: 0.5 }]],
      isSource: true,
      isTarget: false,
    };
    const destEndpoint = {
      anchors: 'Left',
      endpoint: ['Dot', { radius: 8 }],
      paintStyle: { fill: 'transparent', outlineStroke: 'blue', strokeWidth: 1 },
      isSource: false,
      isTarget: true,
    };
    jsPlumb.ready(() => {
      jsPlumb.draggable(`node-${addr}`, { containment: 'parent' });
      jsPlumb.addEndpoint(`node-${addr}`, sourceEndpoint);
      jsPlumb.addEndpoint(`node-${addr}`, destEndpoint);
    });
  }

  render() {
    const { left, top } = this.state;
    const { data, addr } = this.props;
    return (
      <div className="node" id={`node-${addr}`} style={{ left, top }}>
        <span className="node__data">{data}</span>
        <span className="node__addr">{`0x${addr.toString(16).padStart(2, '0')}`}</span>
      </div>
    );
  }
}

Node.propTypes = {
  data: PropTypes.number.isRequired,
  addr: PropTypes.number.isRequired,
};

export default Node;
