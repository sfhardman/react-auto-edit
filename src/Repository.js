import { observable } from 'mobx';
import Joi from 'joi';
import utils from './utils';

class Repository {
  constructor(schema, data = {}) {
    this.schema = schema;
    this.schemaDescription = schema.describe();
    this.data = observable(data);
    this.modelState = observable({
      isDirty: false,
      errors: [],
    });
  }

  setDirty() {
    this.modelState.isDirty = true;
    this.validate();
  }

  clearDirty() {
    this.modelState.isDirty = false;
    this.validate();
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

  getSummary(objectPath) {
    // assuming all data gets loaded into repository._data
    // and we just need to pick it out
    return utils
      .getItemForPath(objectPath, this.schemaDescription, this.data);
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

  validate() {
    const validationResult = Joi.validate(
      this.data,
      this.schema,
      {
        context: this.data,
        abortEarly: false,
      },
    );
    if (validationResult.error) {
      this.modelState.errors.replace(validationResult.error.details);
    } else {
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
