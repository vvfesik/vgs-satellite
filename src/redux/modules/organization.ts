import { Dispatch } from 'redux';
import { fetchOrganizationsList } from 'src/redux/apis/organization';
import { createPicker, createReducer, withLoading } from 'src/redux/utils/modules';

const ORGANIZATIONS_LOADING = 'ORGANIZATIONS_LOADING';
const ORGANIZATIONS_LIST_GET = 'ORGANIZATIONS_LIST_GET';

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

const initialState = {
  isLoading: false,
  listLoading: false,
  organizationsList: [],
};

export default createReducer(initialState, {
  [ORGANIZATIONS_LOADING]: (s: any, a: any) => ({ ...s, listLoading: a.data }),
  [ORGANIZATIONS_LIST_GET]: (s: any, a: any) => ({ ...s, organizationsList: a.data }),
});

export const pickFromOrganization = createPicker('organization', initialState);
