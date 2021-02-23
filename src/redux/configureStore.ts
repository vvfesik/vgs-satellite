import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import preCollect from './modules/preCollect';
import routes from './modules/routes';
import eventLogs from './modules/eventLogs';
import auth from './modules/auth';
import organization from './modules/organization';
import vault from './modules/vault';

const reducer = combineReducers({
  preCollect,
  routes,
  eventLogs,
  auth,
  organization,
  vault,
});

const configureStore = initialState =>
  createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(reduxThunk)),
  );
export default configureStore;
