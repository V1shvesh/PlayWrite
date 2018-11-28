import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Head extends Component {
  componentDidMount() {
    const { addEndpoint, makeDraggable } = this.props;
    const sourceEndpoint = {
      anchors: 'Right',
      endpoint: ['Dot', { radius: 8 }],
      connector: ['Straight'],
      connectorOverlays: [['Arrow', { width: 7, length: 7, location: 0.5 }]],
      isSource: true,
      isTarget: false,
    };
    makeDraggable('node-head', { containment: 'parent' });
    addEndpoint('node-head', sourceEndpoint);
  }

  render() {
    return (
      <div className="node head" id="node-head">
        HEAD
      </div>
    );
  }
}

Head.propTypes = {
  addEndpoint: PropTypes.func.isRequired,
  makeDraggable: PropTypes.func.isRequired,
};
export default Head;
