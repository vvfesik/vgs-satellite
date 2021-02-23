import React from 'react';
import { withRouter } from 'react-router-dom';
import VaultNav from './VaultNav/VaultNav';

export interface IVaultSidebarProps {
  location: any;
}

export const VaultSidebar: React.FC<IVaultSidebarProps> = (props) => {
  return (
    <div className="navside" id="vault-navside">
      <VaultNav />
    </div>
  );
};

export default withRouter(VaultSidebar);
