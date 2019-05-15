import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const booleanEditField = ({ item, fieldName, onChange }) => <input type="checkbox"
  checked={item[fieldName]}
  onChange={(event) => {
    // eslint-disable-next-line no-param-reassign
    item[fieldName] = event.target.checked;
    onChange();
  }}
/>;

export default observer(booleanEditField);
