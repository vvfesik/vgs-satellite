import React from 'react';
import TransformersConfig from './TransformersConfig';
import OperationsSelect from './OperationsSelect';
import modelEmberToJson from 'src/redux/utils/emberModelToJson';
import { isValidPdfOperation } from 'src/redux/utils/routes';

export interface IRouteOperationProps {
  isCSVTransformerEnabled: boolean;
}

export interface IRouteEditorState {
  entry: any;
  onChange: (change: any) => void;
}

class RouteOperation extends React.Component<IRouteEditorState, IRouteOperationProps> {
  static getDerivedStateFromProps({ entry }, state) {
    if (entry && !state.form.operation) {
      const config: any = modelEmberToJson(entry);
      return {
        form: {
          operation: config.operation,
          transformer: config.transformer,
          transformer_config: config.transformer_config,
          transformer_config_map: config.transformer_config_map,
        },
      };
    }

    return state;
  }

  state = {
    form: {
      operation: null,
      transformer: 'json',
      transformer_config: ['$.account_number'],
      transformer_config_map: null,
    },
  };

  changeForm(value: any, key = 'transformer_config', isRegExp = false) {
    // TODO:refactor after https://app.clubhouse.io/vgs/story/51945/migrate-to-a-map-based-transformer-config-on-ui
    const { transformer_config } = this.state.form;
    const { transformer_config_map } = this.state.form;
    const { charset } = this.state.form.transformer_config_map || { charset: 'Default' };
    const getTransformerConfig = () => {
      if (key === 'transformer_config_map' && isRegExp) {
        return value.patterns;
      } else if (key === 'transformer_config') {
        return value;
      }
      return transformer_config;
    };

    const getTransformerConfigMap = () => {
      if (key === 'transformer_config_map') {
        return value;
      } else if (isRegExp && key === 'transformer') {
        return { ...transformer_config_map, patterns: transformer_config };
      } else if (key === 'transformer' || key === 'transformer_config') {
        return transformer_config_map?.tokenDecorator ?
          { tokenDecorator: transformer_config_map.tokenDecorator } : null;
      } else if (key === 'operation') {
        return transformer_config_map ? { charset, patterns: transformer_config, ...transformer_config_map } : null;
      }
      return null;
    };

    const form = {
      ...this.state.form,
      [key]: value,
      transformer_config: getTransformerConfig(),
      transformer_config_map:  getTransformerConfigMap(),
    };

    const validatePdf = (config: string[]) => config.map((ops: string) => isValidPdfOperation(ops));

    if (form.transformer === 'PDF_METADATA_TOKEN') {
      form.isValid = !validatePdf(form.transformer_config).includes(false);
    } else {
      delete form.isValid;
    }

    this.setState({
      form,
    });

    this.props.onChange(form);
    if (value) {
    }
  }

  changeFormTokenDecorator(value: any) {
    const form = {
      ...this.state.form,
      transformer_config_map: value,
    };

    this.setState({
      form,
    });

    this.props.onChange(form);
  }

  render() {
    return (
      <div className="form-group row" data-role="basic-transformers-container">
        <div className="col-sm-3">
          <OperationsSelect
            currentOperation={this.state.form.operation}
            onChange={operation => this.changeForm(operation, 'operation')}
          />
        </div>
        <div className="col-sm-7">
          <TransformersConfig
            isCSVTransformerEnabled={this.props.isCSVTransformerEnabled}
            form={this.state.form}
            onChange={(value, key, isRegExp) => this.changeForm(value, key, isRegExp)}
            changeFormTokenDecorator={value => this.changeFormTokenDecorator(value)}
            transformerConfig={this.state.form.transformer_config}
            transformerConfigMap={this.state.form.transformer_config_map}
          />
        </div>
      </div>
    );
  }
}

export default RouteOperation;
