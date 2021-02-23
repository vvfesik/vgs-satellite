import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from 'src/redux/configureStore';
import { createAuthListener } from 'src/redux/modules/auth';
import Auth from 'src/Auth';
import ErrorBoundary from 'src/ErrorBoundary';
import { initAnalytics } from 'src/redux/utils/analytics';

import './styles/antd-theme.less';
import '@vgs/elemente/dist/elemente.esm.css';
import './styles/app.scss';

const store = configureStore();
store.subscribe(createAuthListener(store));

const Root = (
  <ErrorBoundary>
    <Provider store={store}>
      <Auth />
    </Provider>
  </ErrorBoundary>
);

initAnalytics();
ReactDOM.render(Root, document.getElementById('localhoste-app'));
