import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { initClient } from 'src/redux/modules/auth';
import { fetchRoutes, promoteRouteToRemote, setPromotingState } from 'src/redux/modules/routes';
import { getRemoteRoutesByVault } from 'src/redux/apis/routes';
import { getOrganizationEnvironments } from 'src/redux/modules/organization';
import config from 'src/config/config';
import history from 'src/redux/utils/history';
import PromoteRoute from './PromoteRoute';
import PromoteRouteMergeModal from './PromoteRouteMergeModal';
import useMergeModal from './useMergeModal';
import { notify } from 'src/redux/utils/notifications';
import { normalizeRoute, isInbound } from 'src/redux/utils/routes';
import { pushEvent } from 'src/redux/utils/analytics';
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
  promoteRouteToRemote,
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
  promoteRouteToRemote: (vault: IVaultEssentials, route: IRoute, isMerge?: boolean) => any;
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
      const normalizedRoute = normalizeRoute(route, existingRoute);
      if (existingRoute) {
        showMergeModal(vault, normalizedRoute, existingRoute);
      } else {
        props.promoteRouteToRemote(vault, normalizedRoute);
      }
    } catch (error) {
      notify.error(error.message);
    } finally {
      props.setPromotingState(false);
    }
  };

  const handleRouteMerge = () => {
    pushEvent('route_merge', {
      route_type: isInbound(route) ? 'inbound' : 'outbound',
    });
    props.promoteRouteToRemote(vault, route, true);
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
        handleOk={handleRouteMerge}
        handleCancel={hideMergeModal}
      />
    </>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PromoteRouteContainer);
