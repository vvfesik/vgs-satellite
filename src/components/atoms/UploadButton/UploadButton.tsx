import React from 'react';
import { Form, Label, Input } from 'reactstrap';
import { Icon } from 'src/components/antd';

const UploadButton = ({ onUpload }) => {

  const onReadFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const reader = new FileReader();
    const readFile = (index: number) => {
      if (index >= files.length) return;
      const file = files[index];
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          onUpload(e.target.result);
        } catch (error) {
          e.target.value = '';
        }
        readFile(index + 1);
      };
      reader.readAsText(file);
    };
    readFile(0);
  };

  return (
    <Form>
      <div className="d-flex justify-content-end mb-4">
        <Label className="ant-btn ant-btn-ghost mb-0" for="importFromHAR">
          <Icon type="import" className="mr-2" />
          Upload HAR file(s)
        </Label>
        <Input
          onChange={event => onReadFiles(event)}
          data-role="import-from-har"
          id="importFromHAR"
          name="file"
          type="file"
          hidden
          multiple
        />
      </div>
    </Form>
  );
};

export default UploadButton;
