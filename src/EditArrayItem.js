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
      page: 1,
    });
    this.addItem = this.addItem.bind(this);
    this.removeItems = this.removeItems.bind(this);
    this.checkboxChanged = this.checkboxChanged.bind(this);
    this.filterChanged = this.filterChanged.bind(this);
  }

  componentDidMount() {
    this.props.repository.loadSummary(this.props.objectPath);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.objectPath !== this.props.objectPath) {
      this.props.repository.loadSummary(this.props.objectPath);
    }
  }

  addItem() {
    const {
      objectPath, repository, basePath = '', history,
    } = this.props;
    const newObjectPath = repository.addItem(objectPath);
    history.push(utils.dotPathToUrlPath(newObjectPath, basePath || ''));
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

  filterChanged(event) {
    this.filter.value = event.target.value;
    this.filter.page = 1;
  }

  render() {
    const {
      objectPath, itemSchema, repository, basePath = '',
    } = this.props;
    if (!repository.summaryIsLoaded(objectPath)) {
      return <div>Loading...</div>;
    }
    const data = repository.getSummary(objectPath, itemSchema.items[0],
      this.filter.page, this.filter.value);

    const items = (data.array || [])
      .map(item => ({
        displayName: utils.getItemDisplayName(item, itemSchema.items[0]),
        itemPath: utils.getArrayItemPath(item, itemSchema, objectPath),
      }))
      .filter(item => (!this.filter.value)
        || item.displayName.toUpperCase().includes(this.filter.value.toUpperCase()))
      // .sort((a, b) => a.displayName.localeCompare(b.displayName))
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
    <div className="shed-page-controls">
      <div className={data.page > 1 ? 'shed-page-prev' : 'shed-page-prev disabled'}
        onClick={() => { if (data.page > 1) { this.filter.page -= 1; } }}
      >
        &lt;
      </div>
      <div className="shed-page-number">
        Page {data.page} of {data.totalPages}
      </div>
      <div className={data.page < data.totalPages ? 'shed-page-next' : 'shed-page-next disabled'}
        onClick={() => { if (data.page < data.totalPages) { this.filter.page += 1; } } }
      >
          &gt;
        </div>
    </div>
    <div className="shed-array-controls">
      <div className="shed-array-filter">
        <input type="text" placeholder="Filter..."
          value={this.filter.value}
          onChange={this.filterChanged}
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
