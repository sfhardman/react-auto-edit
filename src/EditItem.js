import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import utils from './utils';
import EditObjectItem from './EditObjectItem';
import EditArrayItem from './EditArrayItem';

const editItem = ({ repository, urlPath, basePath = '' }) => {
  const { schemaDescription } = repository;
  const objectPath = utils.urlPathToDotPath(urlPath);

  const itemSchema = utils.getSchemaForPath(objectPath, schemaDescription);
  let view;
  if (itemSchema.type === 'array') {
    view = <EditArrayItem
      itemSchema={itemSchema} objectPath={objectPath}
      basePath={basePath} repository={repository} />;
  }
  if (itemSchema.type === 'object') {
    view = <EditObjectItem
      itemSchema={itemSchema} objectPath={objectPath}
      basePath={basePath} repository={repository} />;
  }
  return <div className="shed-edit-item">
    {view}
  </div>;
};

export default observer(editItem);
