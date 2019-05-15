import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import utils from '../utils';

const objectEditField = ({ objectPath, fieldName }) => {
  let dotPath;
  if (objectPath) {
    dotPath = `${objectPath}.${fieldName}`;
  } else {
    dotPath = fieldName;
  }

  return <Link
    className="shed-object-link"
    to={utils.dotPathToUrlPath(dotPath)}>
      <div>View...</div>
    </Link>;
};

export default observer(objectEditField);
