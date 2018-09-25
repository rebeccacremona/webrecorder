import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { indexResource } from 'redux-search/dist/commonjs/actions';

import { columns } from 'config';

import { clearSearchIndex } from 'redux/modules/collection';

import { QueryBox } from 'containers';

import Searchbox from 'components/Searchbox';


class CollectionFiltersUI extends PureComponent {
  static contextTypes = {
    canAdmin: PropTypes.bool
  };

  static propTypes = {
    collection: PropTypes.object,
    dispatch: PropTypes.func,
    idPrefix: PropTypes.string,
    isIndexing: PropTypes.bool,
    objects: PropTypes.objects,
    queryable: PropTypes.bool,
    querying: PropTypes.bool,
    search: PropTypes.func,
    searchKey: PropTypes.string,
    searchPages: PropTypes.func,
    searchText: PropTypes.string,
    setPageQuery: PropTypes.func
  };

  static defaultProps = {
    queryable: true
  };

  constructor(props) {
    super(props);

    this.indexed = false;
  }

  componentDidUpdate(prevProps) {
    if (this.props.objects !== prevProps.objects) {
      this.indexed = false;
    }
  }

  componentWillUnmount() {
    this.props.dispatch(clearSearchIndex());
  }

  search = (evt) => {
    const { dispatch, queryable, searchPages, setPageQuery } = this.props;

    const queryColumn = queryable && columns.find(c => evt.target.value.startsWith(`${c}:`));

    if (queryColumn) {
      // TODO: issue with batchActions and redux-search
      dispatch(searchPages(''));
      dispatch(setPageQuery(queryColumn));
    } else {
      dispatch(searchPages(evt.target.value));
    }
  }

  clearSearch = () => {
    const { dispatch, searchPages } = this.props;
    dispatch(searchPages(''));
  }

  startIndex = () => {
    const { dispatch, idPrefix, objects, searchKey, searchPages } = this.props;

    if (this.indexed) {
      return;
    }

    this.indexed = true;

    dispatch(
      indexResource({
        resourceName: searchKey,
        fieldNamesOrIndexFunction: ({ resources, indexDocument }) => {
          resources.forEach((item) => {
            const id = idPrefix ? `${idPrefix}${item.get('id')}` : item.get('id');
            indexDocument(id, item.get('title') || '');
            indexDocument(id, item.get('url').split('?')[0]);
          });
        },
        resources: objects
      })
    );
    dispatch(searchPages(''));
  }

  render() {
    return (
      <div className="wr-coll-utilities">
        {
          this.props.querying ?
            <QueryBox /> :
            <Searchbox
              search={this.search}
              clear={this.clearSearch}
              index={this.startIndex}
              searchText={this.props.searchText}
              isIndexing={this.props.isIndexing} />
        }
      </div>
    );
  }
}

export default CollectionFiltersUI;
