import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const dateEditField = ({
  item, fieldName, readonly, onChange,
}) => <input type="date"
  readOnly={readonly}
  value={item[fieldName]}
  onChange={(event) => {
    // eslint-disable-next-line no-param-reassign
    item[fieldName] = event.target.value || undefined;
    onChange();
  }}/>;

export default observer(dateEditField);
