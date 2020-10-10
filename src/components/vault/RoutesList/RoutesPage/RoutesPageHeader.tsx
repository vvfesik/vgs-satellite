import React from 'react';
import { Link } from 'react-router-dom';
import ImportFromYamlContainer from 'src/components/organisms/ImportFromYaml/ImportFromYamlContainer';
import { Dropdown, Button, Icon, Menu, Radio } from 'src/components/antd';

export interface IRoutesPageHeaderProps {
  hasRoutes: boolean;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const RoutesPageHeader: React.FC<IRoutesPageHeaderProps> = (props) => {
  const { hasRoutes, activeTab, setActiveTab } = props;

  return (
    <div className='row justify-content-center mx-3'>
      {hasRoutes ? (
        <div
          className='col d-flex justify-content-center align-self-center'
          data-role='routes-type-switch'
        >
          <Radio.Group
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <Radio.Button value='all-routes'>All</Radio.Button>
            <Radio.Button value='inbound'>Inbound</Radio.Button>
            <Radio.Button value='outbound'>Outbound</Radio.Button>
          </Radio.Group>
        </div>
      ) : (
        <div className='col d-flex justify-content-center align-self-center text-muted'>
          There are currently no routes.
        </div>
      )}
      <div className='d-flex justify-content-end'>
        <ImportFromYamlContainer />
        {activeTab === 'all-routes' || !hasRoutes ? (
          <Dropdown
            overlay={
              <Menu className='add-routes-dropdown'>
                <Link
                  to='/routes/new/inbound'
                  data-role='new-inbound-route'
                  className='dropdown-item'
                >
                  Inbound route
                </Link>
                <Link
                  to='/routes/new/outbound'
                  data-role='new-outbound-route'
                  className='dropdown-item'
                >
                  Outbound route
                </Link>
              </Menu>
            }
            trigger={['click']}
            placement='bottomRight'
            className='ml-3'
          >
            <Button data-role='add-on-all-routes' className='d-flex'>
              <span>Add Route </span>
              <Icon type='down' />
            </Button>
          </Dropdown>
        ) : (
          <Link
            to={`/dashboard/v/current/routes/new/${activeTab}`}
            data-role={`new-${activeTab}-route`}
            className='ant-btn ant-btn-primary ml-3'
          >
            Add Route
          </Link>
        )}
      </div>
    </div>
  );
};

export default RoutesPageHeader;
