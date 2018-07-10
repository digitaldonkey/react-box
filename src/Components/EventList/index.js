import React, {Component} from 'react'
import PropTypes from 'prop-types'
import EventListItem from './EventListItem'
import './styles.css'

class EventList extends Component {

  render() {
    return (
        <table>
          <thead>
          <tr>
            <th>Block Number</th>
            <th>Event</th>
            <th>Topic</th>
            <th>Params</th>
          </tr>
          </thead>
          <tbody>
          {this.props.events.length > 0 &&
            this.props.events.reverse().map((event, index) => (
              <EventListItem key={index} event={event} />
            ))
          }
          </tbody>
        </table>
    );
  }
}

EventList.propTypes = {
  events: PropTypes.array.isRequired
};

export default EventList
