import React from 'react';
import {
  Form,
  Label,
  Input,
} from 'reactstrap';

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
      <div className="ta-center">
        <Label className="btn btn-primary cursor-pointer" for="importFromYaml">Upload HAR file(s)</Label>
        <Input
          onChange={event => onReadFiles(event)}
          data-role="import-from-yaml"
          id="importFromYaml"
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
