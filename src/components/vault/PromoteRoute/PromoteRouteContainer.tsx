import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initClient } from 'src/redux/modules/auth';
import { fetchRoutes, createRemoteRoute, updateRemoteRoute, setPromotingState } from 'src/redux/modules/routes';
import { getRemoteRoutesByVault } from 'src/redux/apis/routes';
import { getOrganizationEnvironments } from 'src/redux/modules/organization';
import config from 'src/config/config';
import history from 'src/redux/utils/history';
import PromoteRoute from './PromoteRoute';
import PromoteRouteMergeModal from './PromoteRouteMergeModal';
import useMergeModal from './useMergeModal';
import { notify } from 'src/redux/utils/notifications';
import { IRoute } from 'src/redux/interfaces/routes';
import { IVaultEssentials } from 'src/redux/interfaces/vault';
import { IEnvironment } from 'src/redux/interfaces/organization';

const mapStateToProps = ({ auth, organization, vault, routes }: any) => {
  return {
    sessions: auth.sessions,
    organizations: organization.organizationsList,
    environments: organization.environments,
    vaults: vault.vaultsList,
    routes: routes.list,
    isPromoting: routes.isPromoting,
    isMerging: routes.isMerging,
  };
};
const mapDispatchToProps = {
  initClient,
  fetchRoutes,
  createRemoteRoute,
  updateRemoteRoute,
  setPromotingState,
  getOrganizationEnvironments,
};

interface IPromoteRouteContainerProps {
  routeId: string;
  organizations: any[];
  environments: IEnvironment[];
  vaults: IVaultEssentials[];
  sessions: { [clientId: string]: any };
  routes: IRoute[];
  isPromoting: boolean;
  isMerging: boolean;
  initClient: (kcConfig: any, loginOptions?: any) => any;
  fetchRoutes: () => any;
  createRemoteRoute: (vault: IVaultEssentials, route: IRoute) => any;
  updateRemoteRoute: (vault: IVaultEssentials, route: IRoute) => any;
  setPromotingState: (state: boolean) => void;
  getOrganizationEnvironments: (orgId: string) => Promise<any>;
}

const PromoteRouteContainer: React.FC<IPromoteRouteContainerProps> = (props) => {
  const { routeId, sessions, organizations, environments, vaults, routes, isPromoting, isMerging } = props;
  const client = sessions[config.keycloakConfig.clientId];

  useEffect(() => {
    if (!client) {
      props.initClient(config.keycloakConfig, config.keycloakConfig);
    }
    props.fetchRoutes();
  }, [routeId, client]);

  const {
    mergeModalState: { isMergeModal, route, existingRoute, vault },
    showMergeModal,
    hideMergeModal,
  } = useMergeModal();

  const getRouteById = (routeId: string) =>
    routes.find((route: IRoute) => route.id === routeId);

  const getVaultById = (vaultId: string) =>
    vaults.find((vault: IVaultEssentials) => vault.identifier === vaultId);

  const promoteRouteToVault = async (vaultId: string) => {
    props.setPromotingState(true);
    const vault = getVaultById(vaultId);
    const route = getRouteById(routeId);
    try {
      const remoteRoutes = await getRemoteRoutesByVault(vault);
      const existingRoute = remoteRoutes.data.find((r: IRoute) => r.id === routeId);
      if (existingRoute) {
        showMergeModal(vault, route, existingRoute);
      } else {
        props.createRemoteRoute(vault, route);
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      props.setPromotingState(false);
    }
  };

  return !client ? (
    <h2 className='text-text-light _300 text-center mt-5 text-lg'>
      Setting up the remote connection...
    </h2>
  ) : (
    <>
      <PromoteRoute
        handleCancel={() => history.push('/routes')}
        handleOk={promoteRouteToVault}
        isLoading={isPromoting || isMergeModal || isMerging}
        organizations={organizations}
        vaults={vaults}
        environments={environments}
        getOrganizationEnvironments={props.getOrganizationEnvironments}
      />
      <PromoteRouteMergeModal
        route={route}
        existingRoute={existingRoute}
        isVisible={isMergeModal}
        isLoading={isMerging}
        handleOk={() => props.updateRemoteRoute(vault, route)}
        handleCancel={hideMergeModal}
      />
    </>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PromoteRouteContainer);
