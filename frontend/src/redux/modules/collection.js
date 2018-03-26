import { apiPath } from 'config';
import { fromJS } from 'immutable';

const COLL_LOAD = 'wr/coll/COLL_LOAD';
const COLL_LOAD_SUCCESS = 'wr/coll/COLL_LOAD_SUCCESS';
const COLL_LOAD_FAIL = 'wr/coll/COLL_LOAD_FAIL';

const COLL_EDIT = 'wr/coll/COLL_EDIT';
const COLL_EDIT_SUCCESS = 'wr/coll/COLL_EDIT_SUCCESS';
const COLL_EDIT_FAIL = 'wr/coll/COLL_EDIT_FAIL';
const RESET_EDIT_STATE = 'wr/coll/RESET_EDIT_STATE';

const COLL_DELETE = 'wr/coll/COLL_DELETE';
const COLL_DELETE_SUCCESS = 'wr/coll/COLL_DELETE_SUCCESS';
const COLL_DELETE_FAIL = 'wr/coll/COLL_DELETE_FAIL';

const LISTS_LOAD = 'wr/coll/LISTS_LOAD';
const LISTS_LOAD_SUCCESS = 'wr/coll/LISTS_LOAD_SUCCESS';
const LISTS_LOAD_FAIL = 'wr/coll/LISTS_LOAD_FAIL';

const COLL_SET_SORT = 'wr/coll/COLL_SET_SORT';
const COLL_SET_PUBLIC = 'wr/coll/SET_PUBLIC';
const COLL_SET_PUBLIC_SUCCESS = 'wr/coll/SET_PUBLIC_SUCCESS';
const COLL_SET_PUBLIC_FAIL = 'wr/coll/SET_PUBLIC_FAIL';

const NEW_AUTO = 'wr/NEW_AUTO';
const NEW_AUTO_SUCCESS = 'wr/NEW_AUTO_SUCCESS';
const NEW_AUTO_FAIL = 'wr/NEW_AUTO_FAIL';
const QUEUE_AUTO = 'wr/QUEUE_AUTO';
const QUEUE_AUTO_SUCCESS = 'wr/QUEUE_AUTO_SUCCESS';
const QUEUE_AUTO_FAIL = 'wr/QUEUE_AUTO_FAIL';


export const defaultSort = { sort: 'timestamp', dir: 'DESC' };
const initialState = fromJS({
  edited: false,
  editError: null,
  error: null,
  loading: false,
  loaded: false,
  sortBy: defaultSort,
  queued: false
});


export default function collection(state = initialState, action = {}) {
  switch (action.type) {
    case COLL_LOAD:
      return state.set('loading', true);
    case COLL_LOAD_SUCCESS: {
      const {
        pages,
        collection: { created_at, desc, download_url, id, lists, recordings, size, title },
        user
      } = action.result;

      const pgs = {};
      pages.forEach((pg) => { pgs[pg.id] = pg; });

      return state.merge({
        loading: false,
        loaded: true,
        accessed: action.accessed,
        error: null,

        pages: pgs,
        created_at,
        desc,
        download_url,
        id,
        isPublic: action.result.collection['r:@public'],
        lists,
        recordings,
        size,
        title,
        user,
      });
    }
    case COLL_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error
      });
    case COLL_SET_PUBLIC_SUCCESS:
      return state.set('isPublic', action.result.is_public);

    case COLL_SET_SORT:
      return state.merge({
        sortBy: action.sortBy
      });

    case LISTS_LOAD_SUCCESS:
      return state.merge({
        lists: action.result.lists
      });

    case COLL_EDIT_SUCCESS:
      return state.merge({
        edited: true,
        editError: null,
        ...action.result.collection
      });
    case COLL_EDIT_FAIL:
      return state.merge({
        editError: action.error.error_message
      });
    case RESET_EDIT_STATE:
      return state.set('edited', false);
    case NEW_AUTO_SUCCESS:
      return state.set('autoId', action.result.auto);
    case QUEUE_AUTO_SUCCESS:
      return state.set('queued', true);

    case LISTS_LOAD_FAIL:
    case LISTS_LOAD:
    case COLL_SET_PUBLIC:
    case COLL_SET_PUBLIC_FAIL:
    default:
      return state;
  }
}


export function isLoaded({ app }) {
  return app.get('collection') &&
         app.getIn(['collection', 'loaded']) &&
         Date.now() - app.getIn(['collection', 'accessed']) < 15 * 60 * 1000;
}


export function resetEditState() {
  return { type: RESET_EDIT_STATE };
}


export function load(user, coll) {
  return {
    types: [COLL_LOAD, COLL_LOAD_SUCCESS, COLL_LOAD_FAIL],
    accessed: Date.now(),
    promise: client => client.get(`${apiPath}/collection/${coll}`, {
      params: { user }
    })
  };
}


export function loadLists(user, coll, withBookmarks = false) {
  return {
    types: [LISTS_LOAD, LISTS_LOAD_SUCCESS, LISTS_LOAD_FAIL],
    promise: client => client.get(`${apiPath}/lists`, {
      params: { user, coll, include_bookmarks: withBookmarks }
    })
  };
}


export function edit(user, coll, data) {
  return {
    types: [COLL_EDIT, COLL_EDIT_SUCCESS, COLL_EDIT_FAIL],
    promise: client => client.post(`${apiPath}/collection/${coll}`, {
      params: { user },
      data
    }),
    data
  };
}


export function deleteCollection(user, coll) {
  return {
    types: [COLL_DELETE, COLL_DELETE_SUCCESS, COLL_DELETE_FAIL],
    promise: client => client.del(`${apiPath}/collection/${coll}`, {
      params: { user }
    })
  };
}


export function setSort(sortBy) {
  return {
    type: COLL_SET_SORT,
    sortBy
  };
}


export function newAuto(user, coll) {
  return {
    types: [NEW_AUTO, NEW_AUTO_SUCCESS, NEW_AUTO_FAIL],
    promise: client => client.post(`${apiPath}/auto`, {
      params: { user, coll },
      data: {
        hops: 1,
        num_tabs: 4,
        max_browsers: 2
      }
    })
  };
}


export function queueAuto(user, coll, aid, listId) {
  return {
    types: [QUEUE_AUTO, QUEUE_AUTO_SUCCESS, QUEUE_AUTO_FAIL],
    promise: client => client.post(`${apiPath}/auto/${aid}/queue_list`, {
      params: { user, coll },
      data: {
        list: listId
      }
    })
  };
}
