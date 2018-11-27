import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './write.css';

const PLAY = 0;

class Write extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // code: '',
    };
  }

  render() {
    const { input, mode, handleChange } = this.props;
    return (
      <textarea
        className="editor"
        value={input}
        spellCheck={false}
        rows={34}
        cols={40}
        readOnly={mode === PLAY}
        onChange={handleChange}
      />
    );
  }
}

Write.propTypes = {
  input: PropTypes.string.isRequired,
  mode: PropTypes.number.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default Write;
