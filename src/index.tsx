import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from 'src/AppRouter';
import ErrorBoundary from 'src/ErrorBoundary';
import { initAnalytics } from 'src/redux/utils/analytics';

import './styles/antd-theme.less';
import './styles/app.scss';

const Root = (
  <ErrorBoundary>
    <AppRouter />
  </ErrorBoundary>
);

initAnalytics();
ReactDOM.render(Root, document.getElementById('localhoste-app'));
