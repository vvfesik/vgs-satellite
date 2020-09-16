import React from 'react';
import DocsPopover from 'src/components/organisms/DocsPopover/DocsPopover';
import { Input } from 'reactstrap';

export const StorageSelector = (props: any) => {
  function handleOnChange(e) {
    props.onChange(e);
  }
  return (
    <React.Fragment>
      <label id="Storage"  className="text-muted">
        Storage <DocsPopover term="storage"/>
      </label>
      <div>
        <Input
          type="select"
          name="storageSelect"
          id="storageSelect"
          value={props.storage}
          onChange={e => handleOnChange(e)}
          data-role="rule-entry-storage-select"
          className="is-disabled"
        >
            <option value="PERSISTENT" key="Persistent">
              Persistent
            </option>
            <option value="VOLATILE" key="Volatile">
              Volatile
            </option>
        </Input>
      </div>
    </React.Fragment>
  );
};

export default StorageSelector;
