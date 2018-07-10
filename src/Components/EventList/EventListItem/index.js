import React from 'react'
import PropTypes from 'prop-types'

const EventListItem = ({event}) => (
    <tr>
      <td data-column="Block No">{event.blockNumber}</td>
      <td data-column="Event">{event.name}</td>
      <td data-column="Topic">
        <div className="hexStyle">
          {event.signature}<br/>{event.topic}
        </div>
      </td>
      <td data-column="Params">
        {event.inputs.map((p, i) => (
          <div className="param-item" key={i}>

            <span>Name</span>
            <div>{p.name}</div>

            <span>Type</span>
            <div>{p.type}</div>

            <span>Raw value</span>
            <div className="hexStyle">{p.value}</div>

          </div>
        ))}

      </td>
    </tr>

);

EventListItem.propTypes = {
  event: PropTypes.object.isRequired
};

export default EventListItem
