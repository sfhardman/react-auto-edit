import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const stringArrayEditField = ({ item, fieldName, onChange }) => <textarea
  value={(item[fieldName] || []).join('\n')}
  onChange={(event) => {
    if (!item[fieldName]) {
      // eslint-disable-next-line no-param-reassign
      item[fieldName] = [];
    }
    item[fieldName].replace(event.target.value.split('\n'));
    onChange();
  }}
/>;

export default observer(stringArrayEditField);
