import React, { useState } from 'react';
import { IRoute } from 'src/redux/interfaces/routes';
import { Input, Button } from 'src/components/antd';
import { generateRouteName, hostnameFromUri } from 'src/redux/utils/utils';

export interface IRouteNameProps {
  route: IRoute;
  onChangeRouteName: (tags: IRoute) => void;
  isCreate: boolean;
}

export const RouteName = (props: IRouteNameProps) => {
  const [isInvalid, setIsInvalid] = useState(false);

  const onChange = (value: string, field: string) => {
    const route = {
      route: {
        ...props.route,
        tags: {
          ...props.route.tags,
          [field]: value,
        },
      },
    };

    const routeTagsName = {
      tags: route.route.tags,
    };

    props.onChangeRouteName(routeTagsName);
  };

  const onChangeRouteName = (name: string) => {
    setIsInvalid(name ? name.length > 150 : false);
    onChange(name, 'name');
  };

  const generateName = () => {
    const hostName = hostnameFromUri(props.route.destination_override_endpoint);
    const routeName = generateRouteName(hostName !== '*' ? hostName : '');
    onChange(routeName, 'name');
  };

  return (
    <div className="form-group">
      <label className="text-muted">
        Route Name
        {props.isCreate &&
          <small className="text-xs ml-1">(auto-generated)</small>
        }
      </label>
      <div>
        <div className="input-group">
          <Input
            value={props.route.tags.name}
            placeholder="Route name"
            data-role="edit-route-name"
            onChange={e => onChangeRouteName(e.target.value)}
            addonAfter={
              <Button
                type="link"
                style={{ height : '30px' }}
                onClick={generateName}
                data-role="regenerate-route-name"
              >
                Regenerate name
              </Button>
            }
          />
          {isInvalid &&
            <span className="text-danger">Maximum 150 characters only</span>
          }
        </div>
      </div>
    </div>
  );
};

export default RouteName;
