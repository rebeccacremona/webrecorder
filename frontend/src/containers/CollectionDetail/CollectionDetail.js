import React, { Component } from 'react';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import { asyncConnect } from 'redux-connect';
import { createSearchAction } from 'redux-search';
import { List } from 'immutable';

import { isLoaded as isCollLoaded, getBookmarkCount,
         load as loadColl } from 'redux/modules/collection';
import { clear, multiSelect, selectBookmark, selectPage } from 'redux/modules/inspector';
import { load as loadList, removeBookmark, bookmarkSort } from 'redux/modules/list';
import { setQueryMode } from 'redux/modules/pageQuery';
import { isLoaded as isRBLoaded, load as loadRB } from 'redux/modules/remoteBrowsers';

import { getQueryPages, getOrderedPages } from 'redux/selectors';
import { bkSearchResults } from 'redux/selectors/bookmarkSearch';
import { pageSearchResults } from 'redux/selectors/pageSearch';

import CollectionDetailUI from 'components/collection/CollectionDetailUI';


class CollectionDetail extends Component {

  static propTypes = {
    auth: PropTypes.object,
    collection: PropTypes.object,
    match: PropTypes.object
  };

  // TODO: update to new context api
  static childContextTypes = {
    asPublic: PropTypes.bool,
    canAdmin: PropTypes.bool
  };

  getChildContext() {
    const { auth, location: { search }, match: { params: { user } } } = this.props;
    const username = auth.getIn(['user', 'username']);

    const asPublic = search ? search.indexOf('asPublic') !== -1 : false;

    return {
      canAdmin: username === user && !asPublic,
      asPublic
    };
  }

  render() {
    return (
      <CollectionDetailUI {...this.props} />
    );
  }
}


const initialData = [
  {
    promise: ({ location: { search }, store: { dispatch } }) => {
      if (search) {
        const qs = querystring.parse(search.replace(/^\?/, ''));

        if (qs.query && qs.query.includes(':')) {
          const [column, str] = qs.query.split(':');
          dispatch(setQueryMode(true, column, str));
        }
      }

      return undefined;
    }
  },
  {
    promise: ({ match: { params: { coll, list, user } }, store: { dispatch, getState } }) => {
      const state = getState();

      // if switching to list view, prevent reloading collection
      if ((!isCollLoaded(state) || state.app.getIn(['collection', 'id']) !== coll) || !list) {
        let host = '';

        if (__PLAYER__) {
          host = state.app.getIn(['appSettings', 'host']);
        }

        return dispatch(loadColl(user, coll, host));
      }

      return undefined;
    }
  },
  {
    promise: ({ match: { params: { coll, list, user } }, store: { dispatch, getState } }) => {
      const { app } = getState();

      if (list) {
        let host = '';

        if (__PLAYER__) {
          host = app.getIn(['appSettings', 'host']);
        }

        return dispatch(loadList(user, coll, list, host));
      }

      return undefined;
    }
  },
  {
    promise: ({ store: { dispatch, getState } }) => {
      const state = getState();

      if (!isRBLoaded(state)) {
        let host = '';

        if (__PLAYER__) {
          host = state.app.getIn(['appSettings', 'host']);
        }

        return dispatch(loadRB(host));
      }

      return undefined;
    }
  }
];

const mapStateToProps = (outerState) => {
  const { app, reduxAsyncConnect } = outerState;
  const isPgLoaded = app.getIn(['collection', 'loaded']);
  const isBkLoaded = app.getIn(['list', 'loaded']);

  const { pageFeed, pgSearchText } = isPgLoaded ? pageSearchResults(outerState) : { pageFeed: List(), pgSearchText: '' };
  const { bkFeed, bkSearchText } = isBkLoaded ? bkSearchResults(outerState) : { bkFeed: List(), bkSearchText: '' };

  const isPgIndexing = isPgLoaded && !pageFeed.size && app.getIn(['collection', 'pages']).size && !pgSearchText;
  const isBkIndexing = isBkLoaded && bkFeed.size !== app.getIn(['list', 'bookmarks']).size && !bkSearchText;

  const querying = app.getIn(['pageQuery', 'querying']);
  let pages;

  if (querying) {
    pages = getQueryPages(app);
  } else {
    pages = isPgIndexing ? getOrderedPages(app) : pageFeed;
  }

  const bookmarks = isBkIndexing ? app.getIn(['list', 'bookmarks']).toList() : bkFeed;

  return {
    auth: app.get('auth'),
    bookmarks,
    browsers: app.get('remoteBrowsers'),
    bkDeleting: app.getIn(['list', 'bkDeleting']),
    bkDeleteError: app.getIn(['list', 'bkDeleteError']),
    collection: app.get('collection'),
    isBkIndexing,
    list: app.get('list'),
    loaded: reduxAsyncConnect.loaded,
    pages,
    searchText: pgSearchText || bkSearchText
  };
};

const mapDispatchToProps = (dispatch, { match: { params: { user, coll } } }) => {
  return {
    clearInspector: () => dispatch(clear()),
    clearQuery: () => dispatch(setQueryMode(false)),
    clearSearch: () => {
      dispatch(createSearchAction('collection.pages')(''));
      dispatch(createSearchAction('list.bookmarks')(''));
    },
    setMultiInspector: count => dispatch(multiSelect(count)),
    setPageInspector: fields => dispatch(selectPage(fields)),
    setBookmarkInspector: bk => dispatch(selectBookmark(bk)),
    removeBookmark: (list, id) => {
      dispatch(removeBookmark(user, coll, list, id))
        .then(() => dispatch(loadList(user, coll, list)))
        .then(() => dispatch(getBookmarkCount(user, coll, list)));
    },
    saveBookmarkSort: (list, ids) => {
      dispatch(bookmarkSort(user, coll, list, ids));
    },
    dispatch
  };
};

export default asyncConnect(
  initialData,
  mapStateToProps,
  mapDispatchToProps
)(CollectionDetail);
