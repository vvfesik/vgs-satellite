import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initClient } from 'src/redux/modules/auth';
import { fetchRoutes, createRemoteRoute } from 'src/redux/modules/routes';
import config from 'src/config/config';
import history from 'src/redux/utils/history';
import PromoteRoute from './PromoteRoute';
import { IRoute } from 'src/redux/interfaces/routes';
import { IVaultEssentials } from 'src/redux/interfaces/vault';

const mapStateToProps = ({ auth, organization, vault, routes }: any) => {
  return {
    sessions: auth.sessions,
    organizations: organization.organizationsList,
    vaults: vault.vaultsList,
    routes: routes.list,
    isLoading: routes.isLoading,
  };
};
const mapDispatchToProps = {
  initClient,
  fetchRoutes,
  createRemoteRoute,
};

interface IPromoteRouteContainerProps {
  routeId: string;
  organizations: any[];
  vaults: IVaultEssentials[];
  sessions: { [clientId: string]: any };
  routes: IRoute[];
  isLoading: boolean;
  initClient: (kcConfig: any, loginOptions?: any) => any;
  fetchRoutes: () => any;
  createRemoteRoute: (vault: IVaultEssentials, route: IRoute) => any;
}

const PromoteRouteContainer: React.FC<IPromoteRouteContainerProps> = (props) => {
  const { routeId, sessions, organizations, vaults, routes, isLoading } = props;
  const client = sessions[config.keycloakConfig.clientId];

  useEffect(() => {
    if (!client) {
      props.initClient(config.keycloakConfig, config.keycloakConfig);
    }
    props.fetchRoutes();
  }, [routeId, client]);

  const getRouteById = (routeId: string) =>
    routes.find((route: IRoute) => route.id === routeId);

  const getVaultById = (vaultId: string) =>
    vaults.find((vault: IVaultEssentials) => vault.identifier === vaultId);

  const promoteRouteToVault = (vaultId: string) => {
    props.createRemoteRoute(getVaultById(vaultId), getRouteById(routeId));
  };

  return !client ? (
    <h2 className='text-text-light _300 text-center mt-5 text-lg'>
      Setting up the remote connection...
    </h2>
  ) : (
    <PromoteRoute
      handleCancel={() => history.push('/routes')}
      handleOk={promoteRouteToVault}
      isLoading={isLoading}
      organizations={organizations}
      vaults={vaults}
    />
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PromoteRouteContainer);
