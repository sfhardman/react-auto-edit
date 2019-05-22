import { Repository } from 'react-auto-edit';
import { extendObservable, observable } from 'mobx';
import api from './api';

const datasets = [ 'countries', 'cities', 'people' ];

class MyRepository extends Repository {
  constructor(schema, data, pageSize) {
    super(schema, data, pageSize);
    this.summaryData = observable({});
    this.loadedItems = observable([]);
  }

  async save() {
    alert('I don\'t do anything in this example');
  }

  async loadSummary(objectPath) {
    console.log(`loadSummary ${objectPath}`);
    if (this.summaryIsLoaded(objectPath)) {
      return;
    }
    const dataset = datasets.find(ds => objectPath.startsWith(ds));
    if (dataset) {
      const data = await api[`get${dataset}`];
      const extension = {};
      extension[dataset.fieldName] = data;
      extendObservable(this.data, extension);
      console.log(`push ${dataset.fieldName}`);
      this.loadedItems.push(dataset.fieldName);
    } else {
      return [];
    }
  }

  summaryIsLoaded(objectPath) {
    console.log(`summaryIsLoaded ${objectPath}`);
    const dataset = datasets.find(ds => objectPath.startsWith(ds.fieldName));
    if (dataset) {
      console.log('has dataset');
      return this.loadedItems.includes(dataset.fieldName);
    }
    return true;
  }

  async loadDetail(objectPath) {
    console.log(`loadDetail ${objectPath}`);
    await this.loadSummary(objectPath);
  }

  detailIsLoaded(objectPath) {
    console.log(`detailIsLoaded ${objectPath}`);
    return this.summaryIsLoaded(objectPath);
  }
  
  // setDirty() {
  //   super.setDirty();
  // }

  // clearDirty() {
  //   super.clearDirty();
  // }

  // innerValidate() {
  //   const validationResult = super.innerValidate();
  //   return {};
  // }

  // async load() {
  //   const response = await fetch('/data/data.json');
  //   const newData = await response.json();
  //   this.reset(newData);
  // }

  // async cancel() {
  //   await this.load();
  // }
}

export default MyRepository;