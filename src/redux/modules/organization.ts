import { Dispatch } from 'redux';
import { fetchOrganizationsList, getOrgEnvironments } from 'src/redux/apis/organization';
import { createPicker, createReducer, withLoading } from 'src/redux/utils/modules';

const ORGANIZATIONS_LOADING = 'ORGANIZATIONS_LOADING';
const ORGANIZATIONS_LIST_GET = 'ORGANIZATIONS_LIST_GET';
const SET_ORGANIZATION_ENVIRONMENTS = 'SET_ORGANIZATION_ENVIRONMENTS';

export const getOrganizationsList = () =>
  withLoading({ type: ORGANIZATIONS_LOADING })(async (dispatch: Dispatch) => {
    const response = await fetchOrganizationsList();

    dispatch({
      type: ORGANIZATIONS_LIST_GET,
      data: response.data.map(
        ({ sso_saml_config: sso, name, id }: any & {sso_saml_config: Record<string, string | boolean>}) => ({ id, name, sso }),
      ),
    });
  });

export const getOrganizationEnvironments = (organizationId: string) => (dispatch: Dispatch) => {
  getOrgEnvironments(organizationId)
    .then((data) => data.data)
    .then((data: any) => dispatch({ data, type: SET_ORGANIZATION_ENVIRONMENTS }));
};

const initialState = {
  isLoading: false,
  listLoading: false,
  organizationsList: [],
  environments: [],
};

export default createReducer(initialState, {
  [ORGANIZATIONS_LOADING]: (s: any, a: any) => ({ ...s, listLoading: a.data }),
  [ORGANIZATIONS_LIST_GET]: (s: any, a: any) => ({ ...s, organizationsList: a.data }),
  [SET_ORGANIZATION_ENVIRONMENTS]: (s: any, a: any) => ({ ...s, environments: a.data }),
});

export const pickFromOrganization = createPicker('organization', initialState);
