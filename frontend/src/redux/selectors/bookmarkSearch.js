import { createSelector } from 'reselect';
import { getSearchSelectors } from 'redux-search';
import { List } from 'immutable';

import {
  getListBookmarks,
  userSortBy,
  userSortDir
} from './access';


// redux-search
const { text, result } = getSearchSelectors({
  resourceName: 'list.bookmarks',
  resourceSelector: (resourceName, state) => {
    return state.app.getIn(resourceName.split('.'));
  }
});


export const bkSearchResults = createSelector(
  [result, getListBookmarks, userSortBy, userSortDir, text],
  (bkIds, bkObjs, sort, dir, bkSearchText) => {
    const bks = List(bkIds.map(id => bkObjs.get(id)));
    //const bkFeed = bks.sortBy(o => o.get(sort));

    // if (dir === 'DESC') {
    //   return {
    //     bkFeed: bkFeed.reverse(),
    //     bkSearchText
    //   };
    // }
    return {
      bkFeed: bks,
      bkSearchText
    };
  }
);

