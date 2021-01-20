import * as React from 'react';
import { Form, Input } from 'src/components/antd';
import { FormComponentProps } from 'antd/es/form';
import { IOperation } from 'src/redux/interfaces/routes';

interface ICustomScriptOperationProps extends IOperationsFormProps {
  operations?: IOperation[];
  onChange: (operations: IOperation[]) => void;
}

interface IOperationsFormProps extends FormComponentProps {
  form: any;
}

const CustomScriptOperation: React.FC<ICustomScriptOperationProps> = (props) => {
  const { getFieldDecorator, getFieldError, isFieldTouched } = props.form;

  const fieldError = (fieldName: string) =>
    isFieldTouched(fieldName) && getFieldError(fieldName);

  const placeholderText =` # You can use request that is being passed to operation
 # request.data - for raw payload body
 # input.headers - for headers list
 # Last method call have to return input`;

  return (
    <Form id="CustomScriptOperation-form" data-role="CustomScriptOperation-form">
      <Form.Item
        validateStatus={fieldError('operations') ? 'error' : ''}
        help={getFieldError('operations')}
      >
        {getFieldDecorator('operations')(
          <Input.TextArea
            rows={20}
            data-role="CustomScriptOperation-textarea"
            className="code text-text bg-white placeholder-dark"
            placeholder={placeholderText}
          />,
        )}
      </Form.Item>
    </Form>
  );
};

const mapPropsToFields = ({ operations }: ICustomScriptOperationProps) => {
  const operationsValue = operations?.find(
    (operation: IOperation) => operation.name === 'github.com/verygoodsecurity/common/compute/LarkyHttp',
  )?.parameters.script;
  return {
    operations: Form.createFormField({
      ...operations,
      value: operationsValue,
    })
  };
};

const onFieldsChange = (props: any, changed: any) => {
  let operations = [];
  if (changed.operations.value) {
    operations.push({
      name: "github.com/verygoodsecurity/common/compute/LarkyHttp",
      parameters: {
        script: changed.operations.value
      }
    },);
  } else {
    operations = [];
  }
  props.onChange(operations);
};

export default Form.create<ICustomScriptOperationProps>({
  mapPropsToFields,
  onFieldsChange,
})(CustomScriptOperation);
