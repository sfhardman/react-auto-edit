import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const save = ({ repository }) => {
  if (repository.isDirty()) {
    return <div className="shed-save-control"
      onClick={() => repository.save()}>
      save
    </div>;
  }
  return <div className="shed-save-control disabled">
    Save
  </div>;
};

export default observer(save);
