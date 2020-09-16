import React from 'react';
import DataSelection from 'src/components/molecules/DataSelection/DataSelection';
import { buildTree, getDummyEntry } from 'src/redux/utils/quick-integration';
import { getTransformerType } from 'src/redux/utils/data.util';
import { findPathNameRegexp } from 'src/redux/utils/url.util';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import URL from 'url-parse';
import { IPartialEntry } from 'src/redux/interfaces/routes';

interface IQuickIntegrationState {
  tree: any;
  dataSelectHandler: (entry: IPartialEntry) => void;
}

interface IQuickIntegrationProps {
  log: any;
  url: string;
  saveRouteHandler: (ruleEntries: IPartialEntry[]) => void;
  isReverse: boolean;
}

export const mapRuleEntries = (nodes: any, log: any, url: string, isReverse: boolean) => {
  const phase = log.data.value.phase || getDummyEntry(isReverse);
  const ruleEntries: IPartialEntry[] = [];
  let matches = false;
  const contentType =
    log.data.value.contentType ||
    log.data.value.headers['content-type'] ||
    log.data.value.headers['Content-Type'];

  nodes.forEach((node: any) => {
    const ruleEntry = {
      ...getDummyEntry(isReverse),
      phase,
      transformer: getTransformerType(contentType),
      transformer_config: [node.path],
      operation: node.operation,
      public_token_generator: node.publicTokenGenerator,
      token_manager: node.tokenManager,
    };

    const requestUrl = new URL(url);
    const pathRegexp = findPathNameRegexp(requestUrl.pathname);

    // check whatever a rule is using matches operator
    matches = matches ? matches : pathRegexp.regExpFound;

    ruleEntry.config.rules[0].expression = {
      field: 'PathInfo',
      type: 'string',
      operator: (pathRegexp.regExpFound
        ? 'matches'
        : undefined) || 'equals',
      values: [pathRegexp.pathname],
    };

    if (contentType) {
      ruleEntry.config.rules.push({
        condition: null,
        rules: null,
        expression: {
          field: 'ContentType',
          type: 'string',
          operator: 'equals',
          values: [contentType],
        },
      });
    }

    ruleEntries.push(ruleEntry);
  });

  return ruleEntries;
};

export default class QuickIntegration extends React.Component<IQuickIntegrationProps, IQuickIntegrationState> {
  constructor(props: IQuickIntegrationProps) {
    super(props);

    this.state = {
      tree: buildTree(this.props.log, this.props.isReverse),
      dataSelectHandler: (nodes: IPartialEntry) => {
        const mappedRuleEntries = mapRuleEntries(
          nodes,
          this.props.log,
          this.props.url,
          this.props.isReverse,
          );
        this.props.saveRouteHandler(mappedRuleEntries);
      },
    };
  }

  render () {
    const { tree, dataSelectHandler } = this.state;

    return (
      <div>
        <h4 className="mb-3">
          Select the fields that you want to Redact<sup><DocsPopover term="Redact" iconClassName="text-sm" /></sup>
          or Reveal<sup><DocsPopover term="Reveal" iconClassName="text-sm" /></sup>
        </h4>
        {tree && (
          tree.length > 0
            ? (
              <DataSelection
                tree={tree}
                onSelect={dataSelectHandler}
              />
            )
            : (
              <>
                <div>Content-type is not supported</div>
                {tree.errors &&
                  <div>{tree.errors}</div>
                }
              </>
            )
        )}
      </div>
    );
  }
}
