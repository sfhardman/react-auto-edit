import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import Select from 'react-select';
import utils from '../utils';

class FkEditField extends React.Component {
  constructor(props) {
    super(props);
    this.selectionChanged = this.selectionChanged.bind(this);
  }

  componentDidMount() {
    utils.getFkPaths(this.props.fieldSchema)
      .forEach(fkPath => this.props.repository.loadSummary(utils.getParentPath(fkPath)));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fieldName !== this.props.fieldName) {
      utils.getFkPaths(this.props.fieldSchema)
        .forEach(fkPath => this.props.repository.loadSummary(utils.getParentPath(fkPath)));
    }
  }

  selectionChanged(selected) {
    const { item, fieldName, onChange } = this.props;
    item[fieldName] = selected ? selected.value : undefined;
    onChange();
  }

  render() {
    const {
      fieldSchema, item, fieldName, readonly,
      repository,
    } = this.props;
    const fullSchemaDescription = repository.schemaDescription;
    const fkPaths = utils.getFkPaths(fieldSchema);
    if (!fkPaths
      .every(fkPath => repository.summaryIsLoaded(utils.getParentPath(fkPath)))) {
      return <div>Loading...</div>;
    }
    const fkOptions = [];

    fkPaths.forEach((fkPath) => {
      const fkItemSchema = utils
        .getSchemaForPath(utils.getParentPath(fkPath), fullSchemaDescription);

      const fkItems = repository.getSummary(utils.getParentPath(fkPath), fkItemSchema);
      if (fkItems) {
        fkOptions.push(...fkItems.map(fkItem => ({
          label: utils.getItemDisplayName(fkItem, fkItemSchema),
          value: utils.getItemId(fkItem, fkItemSchema),
        })));
      }
    });
    const selectedOption = fkOptions.find(o => o.value === item[fieldName]);

    return <Select options={fkOptions} value={selectedOption}
      onChange={this.selectionChanged}
      isDisabled={readonly}
      isClearable={true}
      classNamePrefix="react-select"
      className="react-select-container"
    />;
  }
}

export default observer(FkEditField);
