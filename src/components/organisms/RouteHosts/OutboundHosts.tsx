import React from 'react';
import { IRoute } from 'src/redux/interfaces/routes';
import { Input, Tooltip } from 'reactstrap';
import IpWhitelisting from './IpWhitelisting';
import classNames from 'classnames';
import AlertWithPopover from 'src/components/molecules/AlertWithPopover/AlertWithPopover';
import { Alert } from 'antd';
import { hostnameFromUri } from 'src/redux/utils/utils';

export interface IOutboundHostsProps {
  route: IRoute;
  isEditMode: boolean;
  onChangeHost: (route: IRoute) => void;
}

export interface IOutboundHostsState {
  isValid: boolean;
  route: IRoute;
  tooltipOpen: boolean;
}

export default class OutboundHosts extends React.Component<IOutboundHostsProps, IOutboundHostsState> {
  state = {
    route: { ...this.props.route },
    isValid: true,
    tooltipOpen: false,
  };

  onChange(value: string, field: string) {
    const route = {
      ...this.state,
      route: {
        ...this.state.route,
        [field]: value,
      },
      isValid: !!value,
    };

    const hostConfig = {
      destination_override_endpoint: route.route.destination_override_endpoint,
      host_endpoint: route.route.host_endpoint,
      source_endpoint: route.route.source_endpoint,
    };

    this.setState(route);
    this.props.onChangeHost(hostConfig);
  }

  onChangeHostEndpoint(hostEndpoint: string) {
    const trimHostEndpoint = hostnameFromUri(hostEndpoint);
    this.onChange(trimHostEndpoint, 'host_endpoint');
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  isPortIncluded(endpoint: string) {
    return /.+:\d+/.test(endpoint);
  }

  render() {
    const isSourceEndpoint = this.state.route.source_endpoint === '*';
    const hostEndpoint = this.state.route.host_endpoint;
    const trimHostEndpoint = hostnameFromUri(hostEndpoint);

    return (
      <>
        {this.isPortIncluded(trimHostEndpoint) &&
          <Alert
            showIcon={false}
            message="Port specification is not supported on Dashboard"
            className="border border-warning rounded-top d-flex alert-with-popover"
            banner
          />
        }
        <div
          className={classNames('form-group', {
            'border border-top-0 rounded-bottom p-3 border-warning': this.isPortIncluded(trimHostEndpoint),
          })}
        >
          <label htmlFor="host_endpoint" className="text-muted">
            Upstream Host
          </label>
          <div>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">http(s)://</span>
              </div>
              <Input
                name="host_endpoint"
                data-role="edit-route-upstream-host"
                value={trimHostEndpoint}
                onChange={e => this.onChangeHostEndpoint(e.target.value)}
              />
            </div>
            {!this.state.route.host_endpoint ? (
              <span className="error-message text-danger">
                Upstream host override can't be blank
              </span>
            ) : null}
            <div className="inline-help-message">
              <em className="text-muted">
                The request host header will be matched against this&nbsp;
                <a
                  href="https://docs.oracle.com/javase/7/docs/api/java/util/regex/Pattern.html"
                  target="_blank"
                >
                  regular expression
                </a>
                . If the request matches the host and the source, the request
                will be processed according to the filters defined
                below, otherwise it will be passed as is.
              </em>
            </div>
          </div>
        </div>

        {isSourceEndpoint &&
          <AlertWithPopover
            showIcon={false}
            bordersStyle="border border-warning rounded-top"
            message="This route allows requests from any IP address, to increase security we recommend that you only allow requests from IP addresses that you control"
          />
        }
        <div
          className={classNames({
            'border border-top-0 rounded-bottom p-3 border-warning': isSourceEndpoint,
          })}
        >
          <p className="mb-0 text-muted">IP Whitelisting</p>
          <div className="inline-help-message mt-0 mb-2">
            <em className="text-muted text-sm">
              Allow requests only from the IPs or&nbsp;
              <span className="text-secondary-light" id="cidr">CIDRs</span>
              <Tooltip
                placement="top"
                className="string-wrapper-tooltip"
                isOpen={this.state.tooltipOpen}
                target="cidr"
                toggle={() => this.toggleTooltip()}
                autohide={false}
              >
                Classless Inter-Domain Routing
              </Tooltip>
            </em>
          </div>
          <IpWhitelisting
            sourceEndpoint={this.props.route.source_endpoint}
            onChange={(values: string) => this.onChange(values, 'source_endpoint')}
          />
        </div>
      </>
    );
  }
}
