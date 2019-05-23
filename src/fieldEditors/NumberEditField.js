import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const numberEditField = ({
  item, fieldName, readonly, onChange,
}) => <input type="number"
  readOnly={readonly}
  value={item[fieldName]}
  onChange={(event) => {
    // eslint-disable-next-line no-param-reassign
    item[fieldName] = Number(event.target.value);
    onChange();
  }}/>;

export default observer(numberEditField);
