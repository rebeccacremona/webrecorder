import { createSelector } from 'reselect';
import { getSearchSelectors } from 'redux-search';
import { List } from 'immutable';

import {
  getPages,
  userSortBy,
  userSortDir
} from './access';


// redux-search
const { text, result } = getSearchSelectors({
  resourceName: 'collection.pages',
  resourceSelector: (resourceName, state) => {
    return state.app.getIn(resourceName.split('.'));
  }
});


export const tsOrderedPageSearchResults = createSelector(
  [result, getPages, text],
  (pageIds, pageObjs, pgSearchText) => {
    const pages = List(pageIds.map(id => pageObjs.get(id)));
    const pageFeed = pages.sortBy(o => o.get('timestamp')).reverse();

    return {
      pageFeed,
      pgSearchText
    };
  }
);


export const pageSearchResults = createSelector(
  [result, getPages, userSortBy, userSortDir, text],
  (pageIds, pageObjs, sort, dir, pgSearchText) => {
    const pages = List(pageIds.map(id => pageObjs.get(id)));
    const pageFeed = pages.sortBy(o => o.get(sort));

    if (dir === 'DESC') {
      return {
        pageFeed: pageFeed.reverse(),
        pgSearchText
      };
    }
    return {
      pageFeed,
      pgSearchText
    };
  }
);

