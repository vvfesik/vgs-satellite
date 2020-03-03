import React from 'react';
import classnames from 'classnames';
import { Button } from 'reactstrap';
import Icon from 'src/components/atoms/Icon/Icon';
import { notify } from 'src/redux/utils/notifications';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import Prism from 'prismjs/prism';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';

export interface ICodeProps {
  numbers?: boolean;
  children?: string;
  language?: string;
  inline?: boolean;
  hideCopy?: boolean;
  onCopy?: () => void;
  icon?: string;
  className?: string;
}

export default class Code extends React.Component<ICodeProps> {
  static defaultProps = {
    numbers: true,
    language: 'markup',
    inline: false,
  };

  componentDidMount() {
    Prism.highlightAll();
  }

  componentDidUpdate() {
    Prism.highlightAll();
  }

  render() {
    if (!this.props.inline) {
      return (
        <pre
          className={classnames(
            { 'line-numbers': this.props.numbers },
            this.props.className,
          )}
        >
          {this.props.icon &&
            <Icon name={this.props.icon} type="text" position="left"/>
          }
          <code className={`language-${this.props.language}`}>
              {this.props.children}
          </code>
          {!this.props.hideCopy &&
            <CopyToClipboard
                text={this.props.children}
                onCopy={() => {
                  notify.success('Copied to clipboard');
                  if (this.props.onCopy) {
                    this.props.onCopy();
                  }
                }}
            >
              <Button color="link" size="sm" className={'position-absolute top right mt-2 text-muted'}>
                  <Icon name="copy" type="text" position="left" />Copy
              </Button>
            </CopyToClipboard>
          }
        </pre>
      );
    } else {
      return (
        <code
          className={classnames(
            `language-${this.props.language}`,
            this.props.className,
          )}
        >
          {this.props.children}
        </code>
      );
    }
  }
}
