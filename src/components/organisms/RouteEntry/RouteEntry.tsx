import React from 'react';

import QueryBuilder from 'src/components/organisms/QueryBuilder/QueryBuilder';
import RouteOperation from 'src/components/organisms/RouteEntry/RouteOperation';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import PhaseSelect from 'src/components/organisms/RouteEntry/PhaseSelect';
import ModeTabs from 'src/components/organisms/RouteEntry/ModeTabs';
import FormatSelector from 'src/components/organisms/RouteEntry/FormatSelector';
import StorageSelector from 'src/components/organisms/RouteEntry/StorageSelector';
import { convertRules } from 'src/redux/utils/query-builder';
import { sftpFields } from 'src/data/query-builder/fields';
import ClassifiersSelect from './ClassifiersSelect';
import { IEntry } from 'src/redux/interfaces/routes';
import { isOperatorExist } from 'src/redux/utils/utils';
import { Alert, Icon  } from 'src/components/antd';
import { isEmpty } from 'ramda';
import CustomScriptOperation from './Operations/CustomScriptOperation';

export interface IRuleEntryProps {
  isExperimentsVisible: boolean;
  entry: IEntry;
  onChange: (value: any) => void;
  isSftp: boolean;
}

export interface IRuleEntryState {
  activeTab: string;
}

export const getActiveTab = (entry: any) => {
  if (entry.operations_v2?.length) {
    return 'advanced';
  } else {
    return 'basic';
  }
};

export class RouteEntry extends React.Component<IRuleEntryProps, IRuleEntryState> {
  state = {
    activeTab: getActiveTab(this.props.entry),
  };

  onChange(change: any) {
    const classifiers = change.classifiers && isEmpty(change.classifiers)
      ? { classifiers: { ...this.props.entry.classifiers, [change.type]: undefined } }
      : {
        classifiers: {
          ...this.props.entry.classifiers,
          ...change.classifiers,
          ...(change.type === 'TAGS' ? { INCLUDE: undefined, EXCLUDE: undefined } : {}),
          ...(['INCLUDE', 'EXCLUDE'].includes(change.type) ? { TAGS: undefined } : {}),
        },
      };

    const entry = {
      ...this.props.entry,
      ...change,
      ...classifiers,
      type: change.type === 'TAGS' ? undefined : change.type,
    };

    this.props.onChange(entry);
  }

  onChangeClassifiers(type: string, value: any) {
    const classifiers = value ? { [type]: value } : {};

    this.onChange({ classifiers, type });
  }

  render() {
    const { entry, isExperimentsVisible, isSftp } = this.props;
    const rules = convertRules(entry.config);
    const isMediaTypeEquals = isOperatorExist(rules.rules, 'media_type_equals');
    return (
      <div className="rule-entry">
        <div className="row">
          <div className="col-sm-8 offset-sm-3 mb-2">
            {isMediaTypeEquals &&
            <Alert
                description={
                  <span>
                    You are using a deprecated filter operator.
                    It works as before, but we recommend to switch to the newer <b>equals</b> operator.
                  </span>
                }
                type="warning"
                showIcon
            />
            }
          </div>
        </div>
        <div className="form-group row">
          <label className="text-muted col-sm-3 col-form-label">Conditions</label>
          <div className="col-sm-8">
            {rules
              ? <QueryBuilder
                rules={rules}
                onChange={(config: any) => this.onChange({ config })}
                defaultValue={isSftp ? '' : 'GET'}
                defaultOperator={isSftp ? 'matches' : null}
                defaultFields={isSftp ? sftpFields : null}
                isMediaTypeEquals={isMediaTypeEquals}
              />
              : null
            }
          </div>
        </div>
        <div className="form-group row">
          <label className="text-muted col-sm-3 col-form-label">Phase</label>
          <div className="col-sm-2">
            <PhaseSelect
              phase={entry.phase}
              onChange={e => this.onChange({ phase: e.target.value })}
              requestLabel={isSftp ? 'PUT' : 'On request'}
              responseLabel={isSftp ? 'GET' : 'On response'}
            />
          </div>
        </div>
        <div className="form-group row">
          <label className="text-muted col-sm-3 col-form-label">Classifiers</label>
          <div className="col-sm-8 mb-2">

            {
              entry.operation === 'REDACT'
                ? (
                  <div className="row mb-2">
                    <div className="col-sm-6">
                      <label className="text-muted">Tags</label>
                      <br/>
                      <ClassifiersSelect
                        placeholder="Select tags"
                        value={entry && entry.classifiers ? entry.classifiers.TAGS : ''}
                        onChange={(values: string) => this.onChangeClassifiers('TAGS', values)}
                      />
                    </div>
                  </div>
                )
                : (
                  <>
                    <div className="row mb-2">
                      <div className="col-sm-6">
                        <label className="text-muted">Tags to include</label>
                        <br/>
                        <ClassifiersSelect
                          mode="tags"
                          placeholder="Select which tags to include"
                          value={entry && entry.classifiers ? entry.classifiers.INCLUDE : ''}
                          onChange={(values: string) => this.onChangeClassifiers('INCLUDE', values)}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="text-muted">Tags to exclude</label>
                        <br/>
                        <ClassifiersSelect
                          mode="tags"
                          placeholder="Select which tags to exclude"
                          value={entry && entry.classifiers ? entry.classifiers.EXCLUDE : ''}
                          onChange={(values: string) => this.onChangeClassifiers('EXCLUDE', values)}
                        />
                      </div>
                    </div>
                  </>
                )
            }

          </div>
        </div>

          <div>
            <div className="row">
              <ModeTabs
                activeTab={this.state.activeTab}
                onChange={(tab: string) => this.changeTab(tab)}
                isSftp={isSftp}
              />
            </div>
            <div className="tab-content">
              <div className="tab-pane active">
                {(() => {
                  switch (this.state.activeTab) {
                    case 'basic':
                      return this.renderOperations();
                    case 'advanced':
                      return <CustomScriptOperation
                        operations={entry.operations_v2}
                        onChange={operations_v2 => this.onChange({ operations_v2 })}
                      />;
                    default:
                      return null;
                  }
                })()}
              </div>
            </div>
          </div>

        <hr/>

        <div className="form-group row">
          <div className="col-sm-7 offset-3">
            <div className="row">
              <div className="col-sm-6">
                <StorageSelector
                  storage={entry.token_manager}
                  onChange={e => this.onChange({ token_manager: e.target.value })}
                />
              </div>

              <div className="col-sm-6">
                <FormatSelector
                  format={entry.public_token_generator}
                  onChange={e => this.onChange({ public_token_generator: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  changeTab(tab: string) {
    this.setState({ activeTab: tab });
  }

  renderOperations() {
    return (
      this.props.entry.operations_v2?.length
        ? (
          <div className="alert d-flex align-items-center">
            <Icon
              type="exclamation-circle"
              className="mr-2 text-warning"
              theme="filled"
            />
            <span>Operations can't be edited. Custom configuration applied.</span>
          </div>
        )
        : (
          <React.Fragment>
            <RouteOperation
              isCSVTransformerEnabled={this.props.isSftp}
              entry={this.props.entry}
              onChange={change => this.onChange(change)}
            />
            {!this.props.isSftp &&
            <div className="form-group row">
                <div
                    className="col-sm-7 offset-3"
                    data-role="rule-entry-targets-inputs"
                >
                    <label className="text-muted">Targets <DocsPopover term="Target"/></label>
                    <StringsArray
                        values={this.props.entry.targets}
                        onChange={targets => this.onChange({ targets })}
                        validator={() => true}
                    />
                </div>
            </div>
            }
          </React.Fragment>
        )
    );
  }
}

export default RouteEntry;
