import {EVENT_LOG_APPEND, EVENT_LOG_CLEAR} from './constants'

const eventLog = (state, action) => {

  // console.log(action.event, 'action@eventLog reducer')
  // console.log(state , 'typeof state@eventLog reducer')


  switch (action.type) {
    case EVENT_LOG_APPEND:
      state = state ? state : [];
      if (action.event) {
        return state.concat(action.event)
      }
      return [];
    case EVENT_LOG_CLEAR:
      return [];
    default:
      return [];
  }
};
export default eventLog;
