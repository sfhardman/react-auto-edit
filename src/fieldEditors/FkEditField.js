import React from 'react'; // eslint-disable-line no-unused-vars
import { observer } from 'mobx-react';
import utils from '../utils';

class FkEditField extends React.Component {
  componentDidMount() {
    utils.getFkPaths(this.props.fieldSchema)
      .forEach(fkPath => this.props.repository.loadSummary(utils.getParentPath(fkPath)));
  }

  render() {
    const {
      fieldSchema, item, fieldName, readonly,
      onChange, repository,
    } = this.props;
    const fullSchemaDescription = repository.schemaDescription;
    const fkPaths = utils.getFkPaths(fieldSchema);
    if (!fkPaths
      .every(fkPath => repository.summaryIsLoaded(utils.getParentPath(fkPath)))) {
      return <div>Loading...</div>;
    }
    const fkOptions = [
      { name: 'select...', id: undefined },
    ];

    fkPaths.forEach((fkPath) => {
      const fkItemSchema = utils
        .getSchemaForPath(utils.getParentPath(fkPath), fullSchemaDescription);

      const fkItems = repository.getSummary(utils.getParentPath(fkPath));
      if (fkItems) {
        fkOptions.push(...fkItems.map(fkItem => ({
          name: utils.getItemDisplayName(fkItem, fkItemSchema),
          id: utils.getItemId(fkItem, fkItemSchema),
        })));
      }
    });
    const options = fkOptions
      .sort((a, b) => {
        if (!a.id) {
          return -1;
        }
        if (!b.id) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((opt, index) => <option value={opt.id} key={index}>{opt.name}</option>);
    return <select value={item[fieldName]}
      disabled={readonly}
      // eslint-disable-next-line no-param-reassign
      onChange={(event) => {
        item[fieldName] = event.target.value;
        onChange();
      }}
      >
      {options}
    </select>;
  }
}

export default observer(FkEditField);
