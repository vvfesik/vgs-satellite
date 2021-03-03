import { useReducer } from 'react';
import { IRoute } from 'src/redux/interfaces/routes';
import { IVaultEssentials } from 'src/redux/interfaces/vault';

const reducer = (state: any, action: any) => {
  const {
    type,
    data: { route = {}, existingRoute = {}, vault = {} } = {},
  } = action;
  switch (type) {
    case 'showMergeModal':
      return { route, existingRoute, vault, isMergeModal: true };
    case 'hideMergeModal':
    default:
      return { ...state, isMergeModal: false };
  }
};

const useMergeModal = () => {
  const [{ isMergeModal, route, existingRoute, vault }, dispatch] = useReducer(reducer, { isMergeModal: false });

  const showMergeModal = (vault: IVaultEssentials, route: IRoute, existingRoute: IRoute) => {
    dispatch({ type: 'showMergeModal', data: { vault, route, existingRoute } });
  };
  const hideMergeModal = () => {
    dispatch({ type: 'hideMergeModal' });
  };

  return {
    showMergeModal,
    hideMergeModal,
    mergeModalState: { isMergeModal, route, existingRoute, vault },
  };
};

export default useMergeModal;
