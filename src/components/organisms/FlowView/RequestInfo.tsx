import React, { useEffect } from 'react';
import classnames from 'classnames';
import { DiffSnippet, setLocalMonaco } from '@vgs/elemente';
import { Table } from 'reactstrap';
import { Input } from 'src/components/antd';
import { isString } from 'lodash';
import { ILogHeaders, ILogBody } from 'src/redux/interfaces/logs';

interface IRequestProps {
  activePhase: 'request' | 'response';
  headers?: ILogHeaders;
  body?: ILogBody;
  isEditMode: boolean;
  isBigPayload?: boolean;
  contentType?: string;
  onEditChange: (payload: any) => void;
  onEditSave: () => void;
}

const Request: React.FC<IRequestProps> = (props) => {
  const { headers, body, activePhase, isEditMode, isBigPayload, contentType, onEditChange, onEditSave } = props;

  useEffect(() => {
    setLocalMonaco('./vs');
  }, []);

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

  const onEditChangeHeader = (key, value) => {
    const changedHeaders = [...headers[activePhase]];
    changedHeaders[key][1] = value;
    onEditChange(changedHeaders);
  }

  return (
    <div className="mt-3 pt-0">
      {headers && (
        <section className="request mt-2">
          {headers[activePhase] ? isEditMode ? (
            <Table striped className="header-table">
              <tbody>
                {headers[activePhase].map((header, key) => (
                  <tr key={key}>
                    <td className="header-name">{header[0]}</td>
                    <td className="header-original pl-0 py-0">
                      <Input.TextArea
                        autoSize
                        value={header[1]}
                        onChange={e => onEditChangeHeader(key, e.target.value)}
                        onPressEnter={onEditSave}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Table striped className="header-table">
              <tbody>
                {rewrittenHeaders && (
                  <>
                    <tr className="heading">
                      <td className="header-name" />
                      <td className="header-original">
                        <p className="heading mb-0">Original</p>
                      </td>
                      <td className="header-rewritten">
                        <p className="heading mb-0">Rewritten</p>
                      </td>
                    </tr>
                    <tr className="d-none">
                      <td className="header-name" />
                      <td />
                      <td />
                    </tr>
                  </>
                )}
                {headers[activePhase].map((header, key) => (
                  <tr
                    key={key}
                    className={classnames({
                      changed: rewrittenHeaders ? header[1] !== findRewrittenHeader(header) : false,
                    })}
                  >
                    <td className="header-name">{header[0]}</td>
                    <td className="header-original">{header[1]}</td>
                    {rewrittenHeaders && (
                      <td className="header-rewritten">
                        {findRewrittenHeader(header)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center mt-4">No headers found</p>
          )}
        </section>
      )}

      {body && (
        <div className='mb-3' data-role='log-payload-body-diff'>
          {body[activePhase] && isString(body[activePhase]) ? (
            isEditMode ? (
              <Input.TextArea
                autoSize
                value={JSON.stringify(body[activePhase])}
                onChange={e => onEditChange(JSON.parse(e.target.value))}
                onPressEnter={onEditSave}
              />
            ) : (
              <DiffSnippet
                oldCode={body[activePhase]}
                newCode={isString(bodyRewritten) ? bodyRewritten : ''}
                oldTitle={bodyRewritten ? 'Original' : ''}
                newTitle={bodyRewritten ? 'Rewritten' : ''}
                splitView={!!bodyRewritten}
                showDiffOnly={false}
                isAdvancedMode={isBigPayload}
                language={contentType}
              />
            )
          ) : (
            <p className='text-center mt-4'>No payload found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Request;
