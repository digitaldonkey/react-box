import {TOGGLE_LOGGING} from './constants'

export const toggleLog = (watchEvents) => {
  console.log(watchEvents, 'action: TOGGLE_LOGGING')
  return {
    type: TOGGLE_LOGGING,
    watchEvents
  }
};
