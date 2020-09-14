import React, { useState } from 'react';
import { Label, Popover, PopoverBody } from 'reactstrap';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import PopoverBs from 'src/components/molecules/PopoverBs/PopoverBs';
import StringsArray from 'src/components/atoms/StringsArray/StringsArray';
import { ITransformerProps } from '.';
import { isRegExp } from 'src/redux/utils/utils';
import CreatableSelect from 'react-select/creatable';
import { Input } from 'src/components/antd';

export const RegExpTransformer: React.FC<ITransformerProps> = (props) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const configRegExp = {
    ...props.operationsMap,
    ...props.operationsMap.charset && { charset: props.operationsMap.charset },
    ...props.operationsMap.patterns && { patterns: props.operationsMap.patterns || props.operations },
  };

  const onChange = (patterns: string[]) => {
    const ops = {
      ...props.operationsMap,
      ...configRegExp.charset && { charset: configRegExp.charset },
      patterns,
    };
    props.onChange(ops, 'transformer_config_map', true);

    const allValid = patterns.every(op => isRegExp(op));

    setPopoverOpen(!allValid);
  };

  const onChangeCharset = (charset: any) => {
    const ops = {
      ...props.operationsMap,
      ...charset.value && { charset: charset.value },
      patterns: configRegExp.patterns || props.operations,
    };

    props.onChange(ops, 'transformer_config_map', true);
  };

  const onChangeReplacement = (replacement: any) => {
    const ops = {
      ...props.operationsMap,
      replacement,
    };
    props.onChange(ops, 'transformer_config_map', true);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: 28,
      height: 28,
      fontSize: 14,
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      paddingTop: 4,
      paddingBottom: 4,
    }),
    menuList: (base: any) => ({
      ...base,
      fontSize: 14,
    }),
  };

  const options = [
    { label: 'Default', value: 'Default' },
    { label: 'UTF-8', value: 'UTF-8' },
    { label: 'UTF-16', value: 'UTF-16' },
    { label: 'UTF-16BE', value: 'UTF-16BE' },
    { label: 'UTF-16LE', value: 'UTF-16LE' },
    { label: 'US-ASCII', value: 'US-ASCII' },
    { label: 'ISO-8859-1', value: 'ISO-8859-1' },
  ];

  if (configRegExp.charset && !options.some(op => op.value === configRegExp.charset)) {
    options.push({ value: configRegExp.charset, label: configRegExp.charset });
  }
  const selected = options.find((f: any) => f.value === configRegExp.charset);

  return (
    <React.Fragment>
      <Label className="text-muted mr-sm-2 popover-target">
        Fields in RegExp <DocsPopover term="regexp" />
      </Label>
      <StringsArray
        values={configRegExp.patterns || props.operations}
        onChange={(ops: string[]) => onChange(ops)}
        validator={value => isRegExp(value)}
        placeholder="^[0-9]{7,14}$"
      />
      <Label className="text-muted mr-sm-2 popover-target" data-role="regexp-replacement-info">
        Replacement&nbsp;
        <PopoverBs iconName="info-circle">
          <a href="https://www.verygoodsecurity.com/docs/terminology/operations#replace-the-value-with-any-text-and-aliased-value" target="_blank">
            Replacement documentation
          </a>
        </PopoverBs>
      </Label>
      <Input
        value={configRegExp.replacement}
        placeholder="Replacement"
        onChange={e => onChangeReplacement(e.target.value)}
      />
      {configRegExp.charset &&
        <>
          <Label className="text-muted mr-sm-2 popover-target">
            Charset
          </Label>
          <CreatableSelect
            options={options}
            onChange={onChangeCharset}
            value={selected}
            styles={selectStyles}
            placeholder="Default"
          />
        </>
      }
      <Popover
        placement="top"
        isOpen={popoverOpen}
        target=".popover-target"
        toggle={() => setPopoverOpen(!popoverOpen)}
      >
        <PopoverBody>
          <p>
          <span onClick={() => setPopoverOpen(!popoverOpen)} className="inilne-block">
            <i className="fa fa-times btn-icon pull-right"/>
          </span>
            You entered invalid Regexp pattern.
          </p>
          <p>
            Example: <mark>{'tok_[a-z]+_[0-9a-zA-Z]{20,22}'}</mark>
          </p>
          <a href="https://regex101.com/" target="_blank">Regexp playground </a>
        </PopoverBody>
      </Popover>
    </React.Fragment>
  );
};
