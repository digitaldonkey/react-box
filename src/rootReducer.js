import {combineReducers} from 'redux'

// Services
//import currentUser from 'Services/User/reducer'

// Components
import watchEvents from './Components/LoggerSwitch/reducer'
import eventLog from './Components/EventList/reducer'


const rootReducer = combineReducers({
  watchEvents, eventLog
});

export default rootReducer
