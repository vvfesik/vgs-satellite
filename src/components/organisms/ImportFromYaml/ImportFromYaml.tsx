import React from 'react';
import { Form, Label, Input } from 'reactstrap';
import { Icon } from 'src/components/antd';

interface IImportFromYamlProps {
  onReadFile: (e: any) => void;
}

const ImportFromYaml: React.FC<IImportFromYamlProps> = (props) => {
  return (
    <Form>
      <Label className="ant-btn ant-btn-ghost mb-0" for="importFromYaml">
        <Icon type="import" className="mr-2" />
        Import YAML file
      </Label>
      <Input
        onChange={event => props.onReadFile(event)}
        data-role="import-from-yaml"
        id="importFromYaml"
        name="file"
        type="file"
        hidden
      />
    </Form>
  );
};

export default ImportFromYaml;
