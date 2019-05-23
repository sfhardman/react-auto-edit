import {
  observable, keys, remove, extendObservable,
} from 'mobx';
import Joi from 'joi';
import utils from './utils';

// validation can take a lot of resources
// so make sure we don't do it on every keystroke
const validationIntervalMs = 250;

class Repository {
  constructor(schema, data = {}, pageSize = 20) {
    this.schema = schema;
    this.pageSize = pageSize;
    this.schemaDescription = schema.describe();
    this.data = observable(data);
    this.modelState = observable({
      isDirty: false,
      errors: [],
    });
    window.setTimeout(() => this.validateIfNeeded(), validationIntervalMs);
  }

  isDirty() {
    return this.modelState.isDirty;
  }

  setDirty() {
    this.modelState.isDirty = true;
    this.needValidation = true;
  }

  clearDirty() {
    this.modelState.isDirty = false;
    this.needValidation = false;
    this.modelState.errors.clear();
  }

  async reset(newData = {}) {
    this.clearDirty();
    keys(this.data).forEach(key => remove(this.data, key));
    extendObservable(this.data, newData);
  }

  // eslint-disable-next-line no-unused-vars
  async loadSummary(objectPath) {
    // in the most basic scenario all the data
    // is loaded in the constructor so nothing to do here
  }

  summaryIsLoaded() {
    // in the most basic scenario all the data
    // is loaded in the constructor so nothing to do here
    return true;
  }

  ensureArray(objectPath) {
    const item = utils.getItemForPath(objectPath, this.schemaDescription, this.data);
    if (!item) {
      utils.initialiseArray(objectPath, this.schemaDescription, this.data);
    }
  }

  getSummary(objectPath, itemSchema, pageNumber, filterValue) {
    if (!(objectPath && itemSchema)) {
      throw new Error('objectPath and itemSchema must be supplied');
    }
    // assuming all data gets loaded into repository._data
    // and we just need to pick it out
    const item = utils.getItemForPath(objectPath, this.schemaDescription, this.data);
    if (!item) {
      if (pageNumber) {
        return {
          array: undefined,
          totalPages: 1,
          page: pageNumber,
          count: 0,
        };
      }
      return item;
    }
    const array = item
      .map(x => ({
        object: x,
        displayName: utils.getItemDisplayName(x, itemSchema),
      }))
      .filter(x => (!filterValue)
        || (x.displayName.toUpperCase().includes(filterValue.toUpperCase())))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .map(x => x.object);

    if (pageNumber) {
      const minIndex = (pageNumber * this.pageSize) - this.pageSize;
      const maxIndex = minIndex + this.pageSize - 1;
      let totalPages = Math.ceil(array.length / this.pageSize);
      if (totalPages === 0) {
        totalPages = 1;
      }
      return {
        count: array.length,
        page: pageNumber,
        totalPages,
        array: array.filter((x, index) => (index >= minIndex) && (index <= maxIndex)),
      };
    }
    return array;
  }

  // eslint-disable-next-line no-unused-vars
  async loadDetail(objectPath) {
    // in the most basic scenario all the data
    // is loaded in the constructor so nothing to do here
  }

  detailIsLoaded() {
    // in the most basic scenario all the data
    // is loaded in the constructor so nothing to do here
    return true;
  }

  // eslint-disable-next-line no-unused-vars
  getDetail(objectPath) {
    // assuming all data gets loaded into repository._data
    // and we just need to pick it out
    return utils
      .getItemForPath(objectPath, this.schemaDescription, this.data);
  }

  addItem(objectPath) {
    this.ensureArray(objectPath);
    const collection = utils
      .getItemForPath(
        objectPath,
        this.schemaDescription,
        this.data,
      );
    const arraySchema = utils.getSchemaForPath(objectPath, this.schemaDescription);

    const newItem = utils.newItem(arraySchema.items[0]);
    collection.push(newItem);
    const newObjectPath = `${objectPath}.["+++${collection.length - 1}"]`;
    this.setDirty();
    return newObjectPath;
  }

  removeItems(itemPaths) {
    itemPaths.forEach(itemPath => utils.removeItem(
      itemPath, this.schemaDescription, this.data,
    ));
    this.setDirty();
  }

  validateIfNeeded() {
    if (this.needValidation) {
      this.needValidation = false;
      this.validate();
    }
    window.setTimeout(() => this.validateIfNeeded(), validationIntervalMs);
  }

  innerValidate() {
    const validationResult = Joi.validate(
      this.data,
      this.schema,
      {
        context: {
          data: this.data,
        },
        abortEarly: false,
      },
    );
    return validationResult;
  }

  validate() {
    const validationResult = this.innerValidate();
    if (validationResult.error) {
      this.modelState.errors.replace(validationResult.error.details);
    } else if (this.modelState.errors.length) {
      this.modelState.errors.clear();
    }
  }

  async cancel() {
    throw new Error('cancel method not implemented');
  }

  async save() {
    throw new Error('save method not implemented');
  }
}

export default Repository;
