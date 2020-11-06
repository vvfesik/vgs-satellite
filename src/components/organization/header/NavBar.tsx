import * as React from 'react';
import { Navbar, Nav, NavItem } from 'reactstrap';
import DocsDropdown from './DocsDropdown';

const NavBar: React.FC = () => {
  return (
    <Navbar id="main-navbar" className="navbar-container" light expand="sm">
      <Nav className="mr-auto" navbar>
        <NavItem className="d-flex align-items-center navbar-logotitle">
          <img src="./images/vgs-dashboard-logo.svg" />
          <span className="pl-3 text-white _600 text-uppercase cursor-default">
            Satellite
          </span>
        </NavItem>
      </Nav>
      <Nav navbar>
        <NavItem>
          <DocsDropdown />
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default NavBar;
