import React from 'react';
import { Button, Icon } from 'src/components/antd';
import FileSaver from 'file-saver';
import classnames from 'classnames';

function save(fileName: string, text: string, eventAction: string, eventLabel: string, category: string) {
  const file = new File([text], fileName, { type: 'text/plain;charset=utf-8' });
  FileSaver.saveAs(file);
}

export interface IDownloadBtnProps {
  text: string;
  fileName: string;
  className?: string;
  eventAction?: string;
  eventLabel?: string;
  category?: string;
  buttonName?: string;
}

const DownloadBtn: React.SFC<IDownloadBtnProps> = (props) => {
  const { text, fileName, className, eventAction, eventLabel, category, buttonName } = props;

  return (
    <Button
      onClick={() => save(fileName, text, eventAction, eventLabel, category)}
      color="accent"
      className={classnames('download-btn', className)}
    >
      <Icon id="download" type="download" /> {buttonName ? buttonName : 'Download'}
    </Button>
  );
};

export default DownloadBtn;
