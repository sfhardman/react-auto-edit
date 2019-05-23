import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import { Link, withRouter } from 'react-router-dom';
import utils from './utils';

const validation = ({ repository, basePath = '' }) => {
  const { schemaDescription } = repository;
  let validationOutput;
  if (repository.modelState.errors.length) {
    const errors = repository.modelState.errors
      .map((err, index) => {
        const dotPath = utils
          .joiPathToDotPath(err.path, schemaDescription, repository.data);
        return <div key={index}>
          <Link to={utils.dotPathToUrlPath(dotPath, basePath)}>{err.message}</Link>
        </div>;
      });
    validationOutput = <div className="shed-validation-failed">
      {errors}
    </div>;
  } else {
    validationOutput = <div className="shed-validation-ok">
    </div>;
  }
  return <div className="shed-validation-overall">
    {validationOutput}
  </div>;
};

export default withRouter(observer(validation));
