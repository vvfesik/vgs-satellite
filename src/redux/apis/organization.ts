import config from 'src/config/config';
import { getData } from 'src/redux/utils/apis';
import { IVault } from 'src/redux/interfaces/vault';

export interface IOrgVaultCreationResponse {
  orgId: string;
  vault: Partial<IVault>;
}

const orgEndpoint = `${config.dashboardApiHost}/organizations`;

export const fetchOrganizationsList = () => getData(orgEndpoint);

export const getOrgEnvironments = (orgId: string) =>
  getData(`${orgEndpoint}/${orgId}/environments`);
