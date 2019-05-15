import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import utils from './utils';

const nav = ({ repository }) => {
  const { schemaDescription } = repository;
  const links = [
    <Link to="/" key="home">
      <div className="shed-nav-link">Home</div>
    </Link>,
  ];
  links.push(...Object.getOwnPropertyNames(schemaDescription.children)
    .map((fieldName) => {
      const fieldSchema = schemaDescription.children[fieldName];
      return <Link key={fieldName}
        to={`/${fieldName}`}>
          <div className="shed-nav-link">
            {utils.getFieldDisplayName(fieldName, fieldSchema)}
          </div>
        </Link>;
    }));
  return <div>
    {links}
  </div>;
};


export default observer(nav);
