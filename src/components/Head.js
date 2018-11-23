import React, { Component } from 'react';
import { jsPlumb } from 'jsplumb';

class Node extends Component {
  componentDidMount() {
    const sourceEndpoint = {
      anchors: 'Right',
      endpoint: ['Dot', { radius: 8 }],
      connector: ['Straight'],
      connectorOverlays: [['Arrow', { width: 7, length: 7, location: 0.5 }]],
      isSource: true,
      isTarget: false,
    };
    jsPlumb.ready(() => {
      jsPlumb.draggable('head', { containment: 'parent' });
      jsPlumb.addEndpoint('head', sourceEndpoint);
    });
  }

  render() {
    return (
      <div className="node head" id="head">
        HEAD
      </div>
    );
  }
}

export default Node;
