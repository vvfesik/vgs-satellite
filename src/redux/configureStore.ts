import { combineReducers, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import preCollect from './modules/preCollect';

const reducer = combineReducers({
  preCollect,
});

const configureStore = initialState =>
  createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(reduxThunk)),
  );
export default configureStore;
