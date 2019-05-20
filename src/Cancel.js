import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';

const cancel = ({ repository }) => {
  if (repository.modelState.isDirty) {
    return <div className="shed-cancel-control"
      onClick={() => repository.cancel()}>
      cancel
    </div>;
  }
  return <div className="shed-cancel-control disabled">
    Cancel
  </div>;
};

export default observer(cancel);
