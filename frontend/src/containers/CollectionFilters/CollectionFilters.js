import React from 'react';
import { connect } from 'react-redux';
import { createSearchAction } from 'redux-search';

import { setQueryMode } from 'redux/modules/pageQuery';

import CollectionFiltersUI from 'components/collection/CollectionFiltersUI';


const mapStateToProps = (outerState, { searchKey }) => {
  const { app } = outerState;
  const searchObj = outerState.search[searchKey];
  const isIndexing = searchObj.isSearching && searchObj.text === '';

  return {
    isIndexing,
    querying: app.getIn(['pageQuery', 'querying']),
    searchText: outerState.search[searchKey].text
  };
};

const mapDispatchToProps = (dispatch, { searchKey }) => {
  return {
    searchPages: createSearchAction(searchKey),
    setPageQuery: coll => dispatch(setQueryMode(true, coll)),
    dispatch
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CollectionFiltersUI);
