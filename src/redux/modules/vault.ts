import { getAllVaults } from 'src/redux/apis/vault';
import {
  createPicker,
  createReducer,
  withLoading,
} from 'src/redux/utils/modules';

const SET_VAULTS_LIST = 'SET_VAULTS_LIST';
const VAULT_LIST_LOADING = 'VAULT_LIST_LOADING';

export const fetchAllVaults = () =>
  withLoading({ type: VAULT_LIST_LOADING })(async (dispatch: any) => {
    const vaultsList = await getAllVaults();
    dispatch({
      type: SET_VAULTS_LIST,
      data: vaultsList.data.map(
        ({
          data: { id, identifier, name, environment },
          links: { vault_management_api },
          relationships: {
            organization: {
              data: { id: orgId },
            },
          },
        }: any) => ({ id, identifier, name, environment, orgId, vault_management_api }),
      ),
    });
  });

const initialState = {
  listLoading: true,
  vaultsList: [],
};

export default createReducer(initialState, {
  SET_VAULTS_LIST: (s: any, a: any) => ({ ...s, vaultsList: a.data }),
  VAULT_LIST_LOADING: (s: any, a: any) => ({ ...s, listLoading: a.data }),
});

export const pickFromVault = createPicker('vault', initialState);
