import * as React from 'react';
import { Navbar, Nav, NavItem } from 'reactstrap';
import { Button } from 'antd';

const NavBar: React.FC = () => {
  return (
    <Navbar id="main-navbar" className="navbar-container" light expand="sm">
      <Nav className="mr-auto" navbar>
        <NavItem className="d-flex align-items-center navbar-logotitle">
          <img src="./images/vgs-satellite-logo.svg" />
        </NavItem>
      </Nav>
      <Nav navbar>
        <NavItem>
          <Button
            type="link"
            className="text-white px-0 mr-3"
            target="_blank"
            href="https://www.verygoodsecurity.com/docs/vgs-satellite/overview"
          >
            Documentation
          </Button>
        </NavItem>
        <NavItem>
          <Button
            type="primary"
            target="_blank"
            href="https://dashboard.verygoodsecurity.com/"
          >
            Go to Dashboard
          </Button>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default NavBar;
