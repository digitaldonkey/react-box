// LoggerSwitch
import React from 'react'


import PropTypes from 'prop-types'
import './styles.css'

const LoggerSwitch = ({watchEvents, handleChange}) => {
  return (
      <span className="switch">
        <input
            id="checkbox"
            type="checkbox"
            className="checkbox"
            onChange={handleChange}
            checked={watchEvents}
        />
        <label htmlFor="checkbox" className="switch-inner">
          <span className="switch__circle">
            <span className="switch__circle-inner"> </span>
          </span>
          <span className="switch__right">Off</span>
          <span className="switch__left">On</span>
        </label>
      </span>
  )
};


LoggerSwitch.propTypes = {
  watchEvents: PropTypes.bool,
  handleChange: PropTypes.func.isRequired
};


export default LoggerSwitch
