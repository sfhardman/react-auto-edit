import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link, withRouter } from 'react-router-dom';
import utils from './utils';

class EditArrayItem extends React.Component {
  constructor(props) {
    super(props);
    this.selectedItems = observable([]);
  }

  componentDidMount() {
    this.props.repository.loadSummary(this.props.objectPath);
    // utils.getFkPathsForArrayMembers(
    //   this.props.objectPath,
    //   repository.schemaDescription,
    // ).forEach(fkPath => repository.loadSummary(utils.getParentPath(fkPath)));
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
      .sort((a, b) => utils.getItemDisplayName(a, itemSchema.items[0]).localeCompare(
        utils.getItemDisplayName(b, itemSchema.items[0])
      ))
      .map((item, index) => {
        const itemPath = utils.getArrayItemPath(item, itemSchema, objectPath);

        return <div className="shed-array-item" key={index}>
          <input type="checkbox" checked={this.selectedItems.includes(itemPath)}
            onChange={(event) => { this.checkboxChanged(event, itemPath); }}
          />
          <Link
            to={utils.dotPathToUrlPath(itemPath, basePath)}>
            <div>
              {utils.getItemDisplayName(item, itemSchema.items[0])}
            </div>
          </Link>
        </div>;
      });
    return <div className="shed-array-view">
    <div className="shed-array-controls">
      <div className="shed-array-count">
        {items.length === 1 ? '1 Item' : `${items.length} Items`}
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
