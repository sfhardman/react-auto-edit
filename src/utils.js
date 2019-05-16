import splitString from 'split-string';

const split = value => splitString(value, { quotes: ['"'] });

const getNextPath = pathChunks => pathChunks
  .filter((chunk, index) => index > 0)
  .join('.');

const fieldIsPk = fieldSchema => fieldSchema.tags
  && fieldSchema.tags.includes('PK');

const getFkPaths = (fieldSchema) => {
  const fkRule = fieldSchema.rules
    .find(r => r.name === 'fk');
  if (!fkRule) {
    return [];
  }
  const { fkPath } = fkRule.arg;
  if (Array.isArray(fkPath)) {
    return fkPath;
  }
  return [fkPath];
};

const getSchemaForPath = (path, schema) => {
  const pathChunks = split(path).filter(chunk => !!chunk);
  if (pathChunks.length === 0) {
    return schema;
  }
  const currentChunk = pathChunks[0];
  if ((schema.type === 'array') && currentChunk.startsWith('[') && currentChunk.endsWith(']')) {
    return getSchemaForPath(getNextPath(pathChunks), schema.items[0]);
  }
  if (schema.type === 'object') {
    return getSchemaForPath(getNextPath(pathChunks), schema.children[currentChunk]);
  }
  return null;
};

const getFieldDisplayName = (fieldName, fieldSchema) => {
  if (fieldSchema.label) {
    return fieldSchema.label;
  }
  return fieldName
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, str => str.toUpperCase());
};

const pksMatch = (candidate, pkValues, itemSchema) => Object
  .getOwnPropertyNames(itemSchema.children)
  .filter(fieldName => fieldIsPk(itemSchema.children[fieldName]))
  // using simple equality because we may be comparing strings to numbers
  // eslint-disable-next-line eqeqeq
  .every((fieldName, index) => candidate[fieldName] == pkValues[index]);

const getItemForPath = (path, schema, data) => {
  const pathChunks = split(path).filter(chunk => !!chunk);
  if (pathChunks.length === 0) {
    return data;
  }
  const currentChunk = pathChunks[0];
  if ((schema.type === 'array') && currentChunk.startsWith('[') && currentChunk.endsWith(']')) {
    if (currentChunk === '[]') {
      // looking for all matching values, not a single value
      const result = [];
      (data || []).forEach((nextItem) => {
        const nextMatches = getItemForPath(
          getNextPath(pathChunks),
          schema.items[0],
          nextItem,
        );
        if (Array.isArray(nextMatches)) {
          result.push(...nextMatches);
        } else if (nextMatches) {
          result.push(nextMatches);
        }
      });
      return result.length ? result : null;
    }
    // looking for a single value by primary keys in square brackets
    const pkValues = JSON.parse(currentChunk);
    let match;
    if ((pkValues.length === 1) && (pkValues[0].startsWith('+++'))) {
      const index = pkValues[0].substring(3);
      match = data[index];
    } else {
      match = data.find(m => pksMatch(m, pkValues, schema.items[0]));
    }
    if (!match) {
      return null;
    }
    return getItemForPath(
      getNextPath(pathChunks),
      schema.items[0],
      match,
    );
  }
  if (schema.type === 'object') {
    return getItemForPath(
      getNextPath(pathChunks),
      schema.children[currentChunk],
      data[currentChunk],
    );
  }
  return null;
};

const getArrayItemPath = (item, parentSchema, parentPath) => {
  const itemSchema = parentSchema.items[0];
  const pks = Object.getOwnPropertyNames(itemSchema.children)
    .filter(fieldName => fieldIsPk(itemSchema.children[fieldName]))
    .map(fieldName => item[fieldName])
    .filter(fieldValue => !!fieldValue);
  return `${parentPath}.${JSON.stringify(pks)}`;
};

const getItemDisplayName = (item, itemSchema) => {
  if (item.name) {
    return item.name;
  }

  const pks = Object.getOwnPropertyNames(itemSchema.children)
    .filter(fieldName => fieldIsPk(itemSchema.children[fieldName]))
    .map(fieldName => item[fieldName])
    .filter(fieldValue => !!fieldValue);

  if (pks.length) {
    return pks.join(' - ');
  }

  return 'unknown';
};

const getItemId = (item, itemSchema) => {
  const pks = Object.getOwnPropertyNames(itemSchema.children)
    .filter(fieldName => fieldIsPk(itemSchema.children[fieldName]))
    .map(fieldName => item[fieldName])
    .filter(fieldValue => !!fieldValue);

  if (pks.length === 1) {
    return pks[0];
  }

  return 'unknown';
};

const getParentPath = path => split(path)
  .filter((item, index, array) => index < (array.length - 1))
  .join('.');

const urlPathToDotPath = (urlPath) => {
  const parts = splitString(urlPath, {
    separator: '/',
    quotes: ['"'],
  });
  return parts.join('.');
};

const dotPathToUrlPath = (dotPath, basePath = '') => {
  const parts = split(dotPath);
  return [basePath, ...parts].join('/');
};

const dotPathIsNewItem = (dotPath) => {
  const parts = split(dotPath);
  return parts.length
    && parts[parts.length - 1].startsWith('["+++')
    && parts[parts.length - 1].endsWith('"]');
};

const newItem = (itemSchema) => {
  const result = {};
  Object.getOwnPropertyNames(itemSchema.children)
    .forEach((fieldName) => {
      const fieldSchema = itemSchema.children[fieldName];
      if (fieldSchema.type === 'array') {
        result[fieldName] = [];
      }
    });
  return result;
};

const getFkPathsForArrayMembers = (arrayObjectPath, schema) => {
  const arraySchema = getSchemaForPath(arrayObjectPath, schema);
  const itemSchema = arraySchema.items[0];
  const result = [];
  Object.getOwnPropertyNames(itemSchema.children)
    .forEach((fieldName) => {
      const fkPaths = getFkPaths(itemSchema.children[fieldName]);
      result.push(...fkPaths);
    });
  return result;
};

const removeItem = (itemPath, schema, data) => {
  const collection = getItemForPath(
    getParentPath(itemPath),
    schema,
    data,
  );
  const item = getItemForPath(
    itemPath,
    schema,
    data,
  );
  const index = collection.indexOf(item);
  collection.splice(index, 1);
};

const itemIsInArray = (itemPath) => {
  const parts = split(itemPath);
  return parts.length
    && parts[parts.length - 1].startsWith('[')
    && parts[parts.length - 1].endsWith(']');
};

const initialiseArray = (arrayPath, schema, data) => {
  const parentItem = getItemForPath(
    getParentPath(arrayPath),
    schema,
    data,
  );
  const fieldName = split(arrayPath).pop();
  parentItem[fieldName] = [];
};

const getErrorFieldForItem = (joiPath, item, data) => {
  if (joiPath.length === 0) {
    return null;
  }
  const currentChunk = joiPath[0];
  if (data === item) {
    return joiPath[0];
  }
  if (typeof currentChunk === 'number') {
    return getErrorFieldForItem(
      joiPath.filter((chunk, index) => index > 0),
      item,
      data[currentChunk],
    );
  }
  if (typeof currentChunk === 'string') {
    return getErrorFieldForItem(
      joiPath.filter((chunk, index) => index > 0),
      item,
      data[currentChunk],
    );
  }
  return null;
};

const getErrorsForItem = (item, data, errors) => {
  return errors
    .map(err => ({
      fieldName: getErrorFieldForItem(err.path, item, data),
      error: err.message,
    }))
    .filter(err => !!err.fieldName);
};

const joiPathToDotPath = (joiPath, schema, data, dotPath = []) => {
  if (joiPath.length === 1) {
    return dotPath.join('.');
  }
  const currentChunk = joiPath[0];
  const item = data[currentChunk];
  const nextJoiPath = joiPath
    .filter((filterItem, index) => index > 0);
  let nextDotPath;
  let itemSchema;
  if (typeof currentChunk === 'number') {
    // eslint-disable-next-line prefer-destructuring
    itemSchema = schema.items[0];
    const arrayItemDotPath = getArrayItemPath(item, schema, dotPath.join('.'));
    nextDotPath = split(arrayItemDotPath);
  } else {
    itemSchema = schema.children[currentChunk];
    nextDotPath = dotPath.slice();
    nextDotPath.push(currentChunk);
  }
  return joiPathToDotPath(
    nextJoiPath,
    itemSchema,
    item,
    nextDotPath,
  );
};

export default {
  getSchemaForPath,
  getFieldDisplayName,
  getItemForPath,
  getItemDisplayName,
  getArrayItemPath,
  getParentPath,
  getItemId,
  urlPathToDotPath,
  dotPathToUrlPath,
  fieldIsPk,
  dotPathIsNewItem,
  newItem,
  getFkPaths,
  getFkPathsForArrayMembers,
  removeItem,
  itemIsInArray,
  initialiseArray,
  getErrorsForItem,
  joiPathToDotPath,
};
