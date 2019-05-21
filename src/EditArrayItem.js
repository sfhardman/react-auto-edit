import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link, withRouter } from 'react-router-dom';
import utils from './utils';

class EditArrayItem extends React.Component {
  constructor(props) {
    super(props);
    this.selectedItems = observable([]);
    this.filter = observable({
      value: '',
    });
  }

  componentDidMount() {
    this.props.repository.loadSummary(this.props.objectPath);
    this.addItem = this.addItem.bind(this);
    this.removeItems = this.removeItems.bind(this);
    this.checkboxChanged = this.checkboxChanged.bind(this);
  }

  addItem() {
    const data = this.props.repository.getSummary(this.props.objectPath);
    if (!data) {
      utils.initialiseArray(this.props.objectPath,
        this.props.repository.schemaDescription, this.props.repository.data);
    }
    const newObjectPath = this.props.repository.addItem(this.props.objectPath);
    this.props.history.push(utils.dotPathToUrlPath(newObjectPath, this.props.basePath || ''));
  }

  removeItems() {
    this.props.repository.removeItems(this.selectedItems);
    this.selectedItems.clear();
  }

  checkboxChanged(event, itemPath) {
    if (event.target.checked) {
      this.selectedItems.push(itemPath);
    } else {
      this.selectedItems.remove(itemPath);
    }
  }

  render() {
    const {
      objectPath, itemSchema, repository, basePath = '',
    } = this.props;
    if (!repository.summaryIsLoaded(objectPath)) {
      return <div>Loading...</div>;
    }
    const data = repository.getSummary(this.props.objectPath);

    const items = (data || [])
      .map(item => ({
        displayName: utils.getItemDisplayName(item, itemSchema.items[0]),
        itemPath: utils.getArrayItemPath(item, itemSchema, objectPath),
      }))
      .filter(item => (!this.filter.value)
        || item.displayName.toUpperCase().includes(this.filter.value.toUpperCase()))
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .map((item, index) => <div className="shed-array-item" key={index}>
          <input type="checkbox" checked={this.selectedItems.includes(item.itemPath)}
            onChange={(event) => { this.checkboxChanged(event, item.itemPath); }}
          />
          <Link
            to={utils.dotPathToUrlPath(item.itemPath, basePath)}>
            <div>
              {item.displayName}
            </div>
          </Link>
        </div>);
    return <div className="shed-array-view">
    <div className="shed-array-controls">
      <div className="shed-array-count">
        {items.length === 1 ? '1 Item' : `${items.length} Items`}
      </div>
      <div className="shed-array-filter">
        <input type="text" placeholder="Filter..."
          value={this.filter.value}
          onChange={(event) => { this.filter.value = event.target.value; }}
        />
      </div>
      <div className="shed-array-add"
        onClick={() => this.addItem()}>+</div>
      <div className="shed-array-remove"
        onClick={() => this.removeItems()}>-</div>
    </div>
    {items}
  </div>;
  }
}

export default withRouter(observer(EditArrayItem));
