import React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

export const ModeTabs = (props: any) => {
  return (
    <Nav className="col-md-12 nav-tabs">
      <NavItem>
        <NavLink
          href="#"
          active={props.activeTab === 'basic'}
          onClick={() => props.onChange('basic')}
          data-role="basic-tab-link"
        >
          Basic
        </NavLink>
      </NavItem>
    </Nav>
  );
};

export default ModeTabs;
