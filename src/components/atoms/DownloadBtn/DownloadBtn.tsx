import React from 'react';
import { Button, Icon } from 'src/components/antd';
import FileSaver from 'file-saver';
import classnames from 'classnames';

function save(fileName: string, text: string, callback?: () => void) {
  const file = new File([text], fileName, { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(file);
  callback?.();
}

export interface IDownloadBtnProps {
  text: string;
  fileName: string;
  className?: string;
  buttonName?: string;
  callback?: () => void;
}

const DownloadBtn: React.SFC<IDownloadBtnProps> = (props) => {
  const { text, fileName, className, buttonName, callback } = props;

  return (
    <Button
      onClick={() => save(fileName, text, callback)}
      color="accent"
      className={classnames('download-btn', className)}
    >
      <Icon id="download" type="download" /> {buttonName ? buttonName : 'Download'}
    </Button>
  );
};

export default DownloadBtn;
