import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import NumberEditField from './NumberEditField';
import StringEditField from './StringEditField';
import StringArrayEditField from './StringArrayEditField';
import BigStringEditField from './BigStringEditField';
import BooleanEditField from './BooleanEditField';
import FkEditField from './FkEditField';
import ObjectArrayEditField from './ObjectArrayEditField';
import ObjectEditField from './ObjectEditField';
import utils from '../utils';

const editField = ({
  item, fieldName, fieldSchema, objectPath,
  isNewItem, onChange, errors, repository,
  fullSchema, basePath = '',
}) => {
  const readonly = utils.fieldIsPk(fieldSchema)
    && !isNewItem;
  let input;
  if (fieldSchema.rules && fieldSchema.rules.find(r => r.name === 'fk')) {
    input = <FkEditField item={item} fieldName={fieldName} repository={repository}
      fieldSchema={fieldSchema} readonly={readonly} onChange={onChange}
      fullSchema={fullSchema}/>;
  } else if (fieldSchema.type === 'number') {
    input = <NumberEditField item={item} fieldName={fieldName}
      readonly={readonly} onChange={onChange}/>;
  } else if (fieldSchema.type === 'string') {
    const maxLengthRule = fieldSchema.rules && fieldSchema.rules.find(r => r.name === 'max');
    const maxLength = maxLengthRule ? maxLengthRule.arg : undefined;
    if (maxLength >= 80) {
      input = <BigStringEditField item={item} fieldName={fieldName} maxLength={maxLength}
        readonly={readonly} onChange={onChange}/>;
    } else {
      input = <StringEditField item={item} fieldName={fieldName} maxLength={maxLength}
        readonly={readonly} onChange={onChange}/>;
    }
  } else if ((fieldSchema.type === 'array') && (fieldSchema.items[0].type === 'string')) {
    input = <StringArrayEditField item={item} fieldName={fieldName} onChange={onChange}/>;
  } else if (fieldSchema.type === 'boolean') {
    input = <BooleanEditField item={item} fieldName={fieldName} onChange={onChange}/>;
  } else if ((fieldSchema.type === 'array') && (fieldSchema.items[0].type === 'object')) {
    input = <ObjectArrayEditField item={item} objectPath={objectPath}
      fieldName={fieldName} fieldSchema={fieldSchema} basePath={basePath}/>;
  } else if (fieldSchema.type === 'object') {
    input = <ObjectEditField item={item} objectPath={objectPath}
      fieldName={fieldName} fieldSchema={fieldSchema} basePath={basePath}/>;
  }
  let inputClassName = 'shed-field-input';

  if (fieldSchema.flags && (fieldSchema.flags.presence === 'required')) {
    inputClassName = `${inputClassName} required`;
  }

  let errorText;

  if (errors && errors.length) {
    inputClassName = `${inputClassName} error`;
    errorText = errors
      .map((error, index) => <div key={index} className="shed-field-error">{error}</div>);
  }

  const fieldDesc = <div className="shed-field-desc">
      {errorText}
      <div>{fieldSchema.description}</div>
    </div>;
  return <div className="shed-edit-field">
      <div className="shed-field-name">{utils.getFieldDisplayName(fieldName, fieldSchema)}</div>
      <div className={inputClassName }>{input}</div>
      {fieldDesc}
  </div>;
};

export default observer(editField);
