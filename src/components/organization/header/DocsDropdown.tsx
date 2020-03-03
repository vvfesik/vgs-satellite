import * as React from 'react';
import classnames from 'classnames';
import { Button } from 'reactstrap';
import config from 'src/config/config';

export default class DocsDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
    };
    this.onBlur = this.onBlur.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.state.dropdownOpen && this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        dropdownOpen: false,
      });
    }
  }

  onBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      this.setState({
        dropdownOpen: false,
      });
    }
  }

  toggleDrop() {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  }

  render() {
    return (
      <div className="btn-group docs-menu">
        <Button
          className="dropdown-toggle"
          type="secondary"
          onClick={() => this.toggleDrop()}
        >
          Documentation
        </Button>
        <ul
          ref={this.setWrapperRef}
          onBlur={this.onBlur}
          className={
            classnames({ show : this.state.dropdownOpen },
                       'dropdown-menu multi-level dropdown-menu-right')}
        >
          <a
            className="dropdown-item"
            href={config.docsLink}
            target="_blank"
            rel="noopener"
          >
            Overview
          </a>
          <a
            className="dropdown-item"
            href={config.docsGuidesLink}
            target="_blank"
            rel="noopener"
          >
            Guides
          </a>
          <a
            className="dropdown-item"
            href={config.docsFaqLink}
            target="_blank"
            rel="noopener"
          >
            FAQ
          </a>
        </ul>
      </div>
    );
  }
}
