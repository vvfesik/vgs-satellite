import React from 'react';
import _ from 'lodash';
import { Treebeard, theme } from 'react-treebeard';
import PopoverBs from 'src/components/molecules/PopoverBs/PopoverBs';
import definitions from 'src/data/terms';
import decorators from './decorators';
import { ruleTokenGenerators } from 'src/data/rules-config';
import StringWrapper from 'src/components/atoms/StringWrapper/StringWrapper';
import { Button } from 'reactstrap';
import { isVolatile } from 'src/redux/utils/utils';

function getTheme(treeTheme) {
  const vgsTheme = _.cloneDeep(treeTheme);

  const customStyles = {
    'tree.base.backgroundColor': '#fff',
    'tree.node.header.base.paddingLeft': '10px',
    'tree.node.header.base.cursor': 'pointer',
    'tree.node.header.base.color': 'inherit',
    'tree.base.color': 'inherit',
    'tree.node.toggle.arrow.fill': 'inherit',
  };

  _.each(customStyles, (value, style) => {
    _.set(vgsTheme, style, value);
  });

  return vgsTheme;
}

const OperationsSelect = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(event) => { onChange(event.target.value); }}
    >
      <option value="REDACT">Redact</option>
      <option value="ENRICH">Reveal</option>
    </select>
  );
};

const TokenManagerSelect = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(event) => { onChange(event.target.value); }}
    >
      <option value="PERSISTENT">Persistent</option>
      <option value="VOLATILE">Volatile</option>
    </select>
  );
};

const TokenGeneratorSelect = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(event) => { onChange(event.target.value); }}
    >
        {ruleTokenGenerators.map((el, index) => (
          <option key={`${el.value}${index}`} value={el.value}>{el.title} </option>
        ))}
    </select>
  );
};

export default class DataSelection extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      cursor: null,
      selectedNodes: [],
    };
  }

  onToggle(node, toggled) {
    if (this.state.cursor) {
      this.state.cursor.active = false;
    }

    node.active = true;
    if (node.children) { node.toggled = toggled; }
    if (node.last) {
      node.selected = !node.selected;

      let nodes = this.state.selectedNodes;
      if (nodes.find(n => n.path === node.path)) {
        nodes = _.without(nodes, node);
      } else {
        nodes = _.concat(nodes, node);
      }

      nodes.forEach((n, idx) => {
        const path = n.path;
        if (isVolatile(path)) {
          n.volatilePreffered = true;
        }
      });

      this.setState({
        selectedNodes: nodes,
      });
    }

    this.setState({ cursor: node });
  }

  onChangeOperation(node, operation) {
    node.operation = operation;

    // will be removed as Redux will come here
    this.forceUpdate();
  }
  onChangeManager(node, manager) {
    node.tokenManager = manager;

    // will be removed as Redux will come here
    this.forceUpdate();
  }
  onChangeGenerator(node, generator) {
    node.publicTokenGenerator = generator;

    // will be removed as Redux will come here
    this.forceUpdate();
  }

  renderFilterEditor() {
    const { selectedNodes } = this.state;

    return (
      <div className="mt-3">
        <div className="row">
          <div className="col-lg-6 col-sm-4">
            Transformer
          </div>
          <div className="col-lg-6">
            <div className="payload-wrapper">
              Operation &nbsp;
              <PopoverBs iconName="info-circle">
                {definitions.operation} <br />
                <a href="https://www.verygoodsecurity.com/docs/terminology/operations" target="_blank">
                  Operations documentation
                </a>
              </PopoverBs>
            </div>
            <div className="payload-wrapper">
              Storage &nbsp;
              <PopoverBs iconName="info-circle">
                {definitions.storage}
              </PopoverBs>
            </div>
            <div className="payload-wrapper">
              Format &nbsp;
              <PopoverBs iconName="info-circle">
                {definitions.format}
              </PopoverBs>
            </div>
          </div>
        </div>
        {selectedNodes.map((node, key) => <div key={key}>
          <div className="row mt-2">
            <div className="col-lg-6 col-sm-4">
              <StringWrapper size={40}>
                {node.path}
              </StringWrapper>
            </div>
            <div className="col-lg-6">
              <div className="payload-wrapper">
                <OperationsSelect
                  value={node.operation}
                  onChange={(value) => { this.onChangeOperation(node, value); }}
                />
              </div>
              <div className="payload-wrapper">
                <TokenManagerSelect
                  value={node.tokenManager}
                  onChange={(value) => { this.onChangeManager(node, value); }}
                />
              </div>
              <div className="payload-wrapper">
                <TokenGeneratorSelect
                  value={node.publicTokenGenerator}
                  onChange={(value) => { this.onChangeGenerator(node, value); }}
                />
              </div>
            </div>
            {node.volatilePreffered &&
            <div className="col-lg-12 mt-2">
              <div className="alert alert-warning" role="alert">
                It looks like you are redacting (revealing) a Security Verification Code of a credit card.
                Please, note that according to PCI requirements security codes should be stored in Volatile Storage
              </div>
            </div>
            }
          </div>
        </div>)}
      </div>
    );
  }

  render() {
    const { tree, onSelect } = this.props;
    const { selectedNodes } = this.state;
    const vgsStyles = getTheme(theme);
    const showWarningMessage = !tree || tree.length === 0;

    return (
      <div>
        {
          showWarningMessage
            ? <div className="alert alert-warning" role="alert">
                Sorry, we can’t parse your request. Please check if it’s correct and send it again.
              </div>
            : <div>
                <Treebeard
                  data={tree}
                  decorators={decorators}
                  style={vgsStyles}
                  onToggle={(node, toggled) => this.onToggle(node, toggled)}
                />
                {selectedNodes.length ? this.renderFilterEditor() : null}

                <div className="mt-5 text-center">
                  <Button
                    color="primary"
                    className="button-next"
                    disabled={!selectedNodes.length}
                    data-role="select-secure-payload"
                    onClick={() => { onSelect(selectedNodes); }}
                  >
                    Secure this payload
                  </Button>
                </div>
              </div>
        }
      </div>
    );
  }
}
