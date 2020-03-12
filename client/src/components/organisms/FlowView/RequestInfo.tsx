import * as React from 'react';
import classnames from 'classnames';
import DiffSnippet from 'src/components/atoms/DiffSnippet/DiffSnippet';
import { Table } from 'reactstrap';
import { isString } from 'lodash';
import { ILogHeaders, ILogBody } from 'src/redux/interfaces/logs';

interface IRequestProps {
  activePhase: 'request' | 'response';
  headers?: ILogHeaders;
  body?: ILogBody;
}

const Request: React.SFC<IRequestProps> = (props) => {
  const { headers, body, activePhase } = props;
  const findRewrittenHeader = ([key, value]) => {
    const index = headers[activePhase]
      .filter(h => h[0] === key)
      .findIndex(h => h[1] === value);
    const header = headers[`${activePhase}Rewritten`]
      .filter(h => h[0] === key)[index];
    if (header) return header[1];
  };

  const rewrittenHeaders = headers && headers[`${activePhase}Rewritten`];
  const bodyRewritten = body && body[`${activePhase}Rewritten`];

  return (
    <div className="mt-3 pt-0">
      {headers && (
        <section className="request mt-2">
          {headers[activePhase]  ? (
            <Table striped className="header-table">
              <tbody>
                <tr className="heading">
                  <td className="header-name" />
                </tr>
                <tr className="d-none">
                  <td className="header-name" />
                  <td />
                  <td />
                </tr>
                {headers[activePhase].map((header, key) => (
                  <tr
                    key={key}
                    className={classnames({
                      changed: rewrittenHeaders ? header[1] !== findRewrittenHeader(header) : false,
                    })}
                  >
                    <td className="header-name">{header[0]}</td>
                    <td className="header-original">{header[1]}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center mt-4">No headers found</p>
          )}
        </section>
      )}
      {body
      && (
        <div className="mb-3" data-role="log-payload-body-diff">
          {body[activePhase] && isString(body[activePhase]) ? (
            <DiffSnippet
              oldCode={body[activePhase]}
              newCode={isString(bodyRewritten) ? bodyRewritten : ''}
              oldTitle=""
              newTitle=""
              splitView={false}
              showDiffOnly={true}
            />
          ) : (
            <p className="text-center mt-4">No payload found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Request;
