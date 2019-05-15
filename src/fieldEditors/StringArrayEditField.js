import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const stringArrayEditField = ({ item, fieldName, onChange }) => <textarea
  value={(item[fieldName] || []).join('\n')}
  onChange={(event) => {
    item[fieldName].replace(event.target.value.split('\n'));
    onChange();
  }}
/>;

export default observer(stringArrayEditField);
