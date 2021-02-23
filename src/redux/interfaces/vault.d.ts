export interface IVaultLinks {
  vault_management_api: string;
  reverse_proxy?: string;
  forward_proxy?: string;
}

export interface IVaultData {
  id: string;
  identifier: string;
  environment: string;
  name: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  credentials?: ICredentials;
}

export interface ICredentials {
  key: string;
  secret: string;
}

export interface IVaultRelationships {
  organization: {
    links: {
      self: string;
      related: string;
    };
    data: {
      type: string;
      id: string;
    };
  };
}

export interface IVault {
  links: IVaultLinks;
  data: IVaultData;
  relationships: IVaultRelationships;
}

export interface IVaultEssentials {
  id: string;
  identifier: string;
  name: string;
  environment: string;
  orgId: string;
  vault_management_api: string;
}

export type IPartialVault = Partial<IVault>;
export type IPartialVaultData = Partial<IVaultData>;
