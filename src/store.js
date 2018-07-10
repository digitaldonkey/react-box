import {createStore, applyMiddleware, compose} from 'redux'
import {createLogicMiddleware} from 'redux-logic'
import rootReducer from './rootReducer'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose



const store = createStore (
  rootReducer,
  composeEnhancers(
    applyMiddleware(
      createLogicMiddleware()
    ),
  )
);

export default store
