import {TOGGLE_LOGGING} from './constants'

const watchEvents = (state = false, action) => {
  switch (action.type) {
    case TOGGLE_LOGGING:
      return action.watchEvents
    default:
      if (!state) {
        return false
      }
      return state
  }
};
export default watchEvents;
