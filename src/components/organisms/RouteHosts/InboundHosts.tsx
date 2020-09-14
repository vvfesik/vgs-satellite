import React, { useState } from 'react';
import { IRoute } from 'src/redux/interfaces/routes';
import { Input, Tooltip } from 'reactstrap';
import { isValidHostname, hostnameFromUri } from 'src/redux/utils/utils';
import IpWhitelisting from './IpWhitelisting';

export interface IInboundHostsProps {
  route: IRoute;
  routes: IRoute[];
  cnames: any[];
  isEditMode: boolean;
  onChangeHost: (route: IRoute) => void;
}

const InboundHosts: React.FC<IInboundHostsProps> = (props) => {
  const [state, setState] = useState({
    isAdvancedMode: false,
    route: { ...props.route },
    isValid: true,
    tooltipOpen: false,
  });

  const onChange = (value: string, field: string) => {
    const route = {
      ...state,
      route: {
        ...state.route,
        [field]: value,
      },
      isValid: !!value,
    };

    const hostConfig = {
      destination_override_endpoint: route.route.destination_override_endpoint,
      host_endpoint: route.route.host_endpoint,
      source_endpoint: route.route.source_endpoint,
    };

    setState({ ...state, ...route });
    props.onChangeHost(hostConfig);
  };

  const onChangeDestOverride = (destinationOverride: string) => {
    const hostOnly = hostnameFromUri(destinationOverride);

    onChange(`https://${hostOnly}`, 'destination_override_endpoint');
  };

  const toggleTooltip = () => {
    setState({
      ...state,
      tooltipOpen: !state.tooltipOpen,
    });
  };

  const destOverride = state.route.destination_override_endpoint;
  const destOverrideHost = hostnameFromUri(destOverride);

  return (
      <>
        <div className="form-group">
          <label htmlFor="destination_override_endpoint" className="text-muted">Upstream Host</label>
          <div>
            <div className="input-group">
              <div className="input-group-prepend"><span className="input-group-text">https://</span></div>
              <Input
                id="destination_override_endpoint"
                name="destination_override_endpoint"
                data-role="edit-route-upstream-host"
                value={destOverrideHost}
                type="text"
                onChange={e => onChangeDestOverride(e.target.value)}
              />
            </div>
            {!destOverride ? (
              <span className="error-message text-danger">
                Upstream host override can't be blank
              </span>
            ) : (
              !isValidHostname(destOverrideHost) && (
                <span className="error-message text-danger">
                  Please enter a valid hostname
                </span>
              )
            )}
            <div className="inline-help-message">
              <em className="text-muted text-sm">
                The destination of your requests.
                Typically it’s your API server.</em>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-0 text-muted">IP Whitelisting</p>
          <div className="inline-help-message mt-0 mb-2">
            <em className="text-muted text-sm">
              Allow requests only from the IPs or&nbsp;
              <span className="text-secondary-light" id="cidr">CIDRs</span>
              <Tooltip
                placement="top"
                className="string-wrapper-tooltip"
                isOpen={state.tooltipOpen}
                target="cidr"
                toggle={() => toggleTooltip()}
                autohide={false}
              >
                Classless Inter-Domain Routing
              </Tooltip>
            </em>
          </div>
          <IpWhitelisting
            sourceEndpoint={props.route.source_endpoint}
            onChange={(values: string) => onChange(values, 'source_endpoint')}
          />
        </div>
      </>
  );
};

export default InboundHosts;
