import React from 'react'; // eslint-disable-line no-unused-vars
import { Route } from 'react-router-dom';
import EditItem from './EditItem';

const genericRoute = ({ repository, schema, basePath = '' }) => <Route path={`${basePath}/*`} exact={true}
  component={({ match }) => <EditItem schema={schema}
    basePath={basePath}
    urlPath={match.params[0]} repository={repository}/>} />;
export default genericRoute;
