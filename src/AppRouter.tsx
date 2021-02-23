import React from 'react';
import { Router } from 'react-router-dom';
import history from 'src/redux/utils/history';
import App from 'src/App';

const AppRouter: React.FC = () => {
  return (
    <Router history={history}>
      <App />
    </Router>
  );
};

export default AppRouter;
