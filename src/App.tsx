import React from 'react';
import { withRouter } from 'react-router-dom';
import PreCollectContainer from 'src/components/vault/PreCollect/PreCollectContainer';
import NavBar from 'src/components/organization/header/NavBar';

const App: React.FunctionComponent = () => {
  return (
    <div>
      <div className="navbar-wrapper navbar-simple">
        <NavBar />
      </div>
      <div className="main-menu-content mb-3 mt-5">
        <div className="content d-flex">
          <div id="vault-content" className="container-fluid mt-5">
            <PreCollectContainer routeType="inbound" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(App);