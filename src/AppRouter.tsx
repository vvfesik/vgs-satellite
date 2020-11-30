import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'src/redux/configureStore';
import history from 'src/redux/utils/history';
import App from 'src/App';
import { initAnalytics } from 'src/redux/utils/analytics';

const store = configureStore();

const AppRouter: React.FC = () => {
  React.useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <Provider store={store}>
      <Router history={history}>
        <App />
      </Router>
    </Provider>
  );
};

export default AppRouter;
