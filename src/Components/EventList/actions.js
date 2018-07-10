import {EVENT_LOG_APPEND, EVENT_LOG_CLEAR} from './constants'

export const addEvent = (event) => {
  // console.log('action: EVENT_LOG_APPEND', event);
  return {
    type: EVENT_LOG_APPEND,
    event
  }
};

export const clearEventLog = () => {
  console.log('action: EVENT_LOG_CLEAR');
  return {
    type: EVENT_LOG_CLEAR,
  }
};
