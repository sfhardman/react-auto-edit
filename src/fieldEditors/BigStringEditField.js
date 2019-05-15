import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const bigStringEditField = ({
  item, fieldName, readonly, onChange, maxLength,
}) => <textarea
  readOnly={readonly}
  value={item[fieldName]}
  maxLength={maxLength}
  onChange={(event) => {
    // eslint-disable-next-line no-param-reassign
    item[fieldName] = event.target.value || undefined;
    onChange();
  }}/>;

export default observer(bigStringEditField);
