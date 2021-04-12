import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import config from 'src/config/config';
import AppRouter from './AppRouter';
import history from 'src/redux/utils/history';
import { initClient, setActiveClient } from 'src/redux/modules/auth';
import { getOrganizationsList } from 'src/redux/modules/organization';
import { fetchAllVaults } from 'src/redux/modules/vault';

interface IAuthProps {
  sessions: { [clientId: string]: any };
  initClient: (config: any) => any;
  setActiveClient: (client: string) => any;
  activeClient: string;
  getOrganizationsList: () => Promise<any>;
  fetchAllVaults: () => Promise<any>;
}

const mapStateToProps = ({ auth }: any) => {
  return {
    sessions: auth.sessions,
    activeClient: auth.activeClient,
  };
}

const mapDispatchToProps = {
  initClient,
  setActiveClient,
  getOrganizationsList,
  fetchAllVaults,
};

const { keycloakConfig } = config;

const Auth: React.FC<IAuthProps> = (props) => {
  const client = props.sessions[keycloakConfig.clientId];

  useEffect(() => {
    if (!client) {
      props.initClient(keycloakConfig);
    } else {
      if (props.activeClient !== keycloakConfig.clientId) {
        props.setActiveClient(keycloakConfig.clientId);
      }

      props.getOrganizationsList();
      props.fetchAllVaults();

      const currentUserEmail = client.currentUserEmail;
      if (currentUserEmail && currentUserEmail !== window.heap?.identity) {
        window.heap?.identify(currentUserEmail);
      }

      const pathToRedirect = localStorage.getItem('pathToRedirect');
      if (pathToRedirect) {
        localStorage.removeItem('pathToRedirect');
        history.push(pathToRedirect);
      }
    }
  }, [client]);

  return (
    <div id="main-content" className="main-content">
      <AppRouter />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
