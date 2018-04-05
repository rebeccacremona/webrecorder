import { fromJS } from 'immutable';

import { apiPath } from 'config';


const LIST_CREATE = 'wr/list/LIST_CREATE';
const LIST_CREATE_SUCCESS = 'wr/list/LIST_CREATE_SUCCESS';
const LIST_CREATE_FAIL = 'wr/list/LIST_CREATE_FAIL';

const LIST_ADD = 'wr/list/LIST_ADD';
const LIST_ADD_SUCCESS = 'wr/list/LIST_ADD_SUCCESS';
const LIST_ADD_FAIL = 'wr/list/LIST_ADD_FAIL';

const BULK_ADD = 'wr/list/BULK_ADD';
const BULK_ADD_SUCCESS = 'wr/list/BULK_ADD_SUCCESS';
const BULK_ADD_FAIL = 'wr/list/BULK_ADD_FAIL';

const LIST_LOAD = 'wr/list/LIST_LOAD';
const LIST_LOAD_SUCCESS = 'wr/list/LIST_LOAD_SUCCESS';
const LIST_LOAD_FAIL = 'wr/list/LIST_LOAD_FAIL';

const LIST_EDIT = 'wr/list/LIST_EDIT';
const LIST_EDIT_SUCCESS = 'wr/list/LIST_EDIT_SUCCESS';
const LIST_EDIT_FAIL = 'wr/list/LIST_EDIT_FAIL';
const LIST_EDITED_RESET = 'wr/list/LIST_EDITED_RESET';

const LIST_REORDER = 'wr/list/LIST_REORDER';
const LIST_REORDER_SUCCESS = 'wr/list/LIST_REORDER_SUCCESS';
const LIST_REORDER_FAIL = 'wr/list/LIST_REORDER_FAIL';

const LIST_REMOVE = 'wr/list/LIST_REMOVE';
const LIST_REMOVE_SUCCESS = 'wr/list/LIST_REMOVE_SUCCESS';
const LIST_REMOVE_FAIL = 'wr/list/LIST_REMOVE_FAIL';

const BOOKMARK_EDIT = 'wr/list/BOOKMARK_EDIT';
const BOOKMARK_EDIT_SUCCESS = 'wr/list/BOOKMARK_EDIT_SUCCESS';
const BOOKMARK_EDIT_FAIL = 'wr/list/BOOKMARK_EDIT_FAIL';
const RESET_BOOKMARK_EDIT = 'wr/list/RESET_BOOKMARK_EDIT';

const BOOKMARK_REMOVE = 'wr/list/BOOKMARK_REMOVE';
const BOOKMARK_REMOVE_SUCCESS = 'wr/list/BOOKMARK_REMOVE_SUCCESS';
const BOOKMARK_REMOVE_FAIL = 'wr/list/BOOKMARK_REMOVE_FAIL';


const initialState = fromJS({
  bookmarks: [],
  bkEdited: false,
  edited: false,
  loading: false,
  loaded: false,
  error: null
});


export default function list(state = initialState, action = {}) {
  switch (action.type) {
    case LIST_REORDER_SUCCESS:
      return state.set(
        'bookmarks',
        state.get('bookmarks').sort((a, b) => {
          const aidx = action.order.indexOf(a.get('id'));
          const bidx = action.order.indexOf(b.get('id'));

          if (aidx < bidx) return -1;
          if (aidx > bidx) return 1;
          return 0;
        })
      );
    case LIST_EDIT_SUCCESS:
      return state.merge({
        edited: true,
        ...action.data
      });
    case LIST_EDITED_RESET:
      return state.set('edited', false);
    case LIST_LOAD:
      return state.merge({
        loading: true,
        loaded: false
      });
    case LIST_LOAD_SUCCESS:
      return state.merge({
        loading: false,
        loaded: true,
        ...action.result.list
      });
    case LIST_LOAD_FAIL:
      return state.set('error', true);
    case BOOKMARK_EDIT_SUCCESS:
      return state.set('bkEdited', true);
    case RESET_BOOKMARK_EDIT:
      return state.set('bkEdited', false);
    default:
      return state;
  }
}


export function listLoaded(id, { app }) {
  // TODO: add accessed check
  return app.getIn(['list', 'loaded']) &&
         id === app.getIn(['list', 'id']);
}


export function create(user, coll, title) {
  return {
    types: [LIST_CREATE, LIST_CREATE_SUCCESS, LIST_CREATE_FAIL],
    promise: client => client.post(`${apiPath}/lists`, {
      params: { user, coll },
      data: { title }
    })
  };
}


export function addTo(user, coll, listId, data) {
  return {
    types: [LIST_ADD, LIST_ADD_SUCCESS, LIST_ADD_FAIL],
    promise: client => client.post(`${apiPath}/list/${listId}/bookmarks`, {
      params: { user, coll },
      data
    })
  };
}


export function bulkAddTo(user, coll, listId, data) {
  return {
    types: [BULK_ADD, BULK_ADD_SUCCESS, BULK_ADD_FAIL],
    promise: client => client.post(`${apiPath}/list/${listId}/bulk_bookmarks`, {
      params: { user, coll },
      data
    })
  };
}


export function load(user, coll, id) {
  return {
    types: [LIST_LOAD, LIST_LOAD_SUCCESS, LIST_LOAD_FAIL],
    promise: client => client.get(`${apiPath}/list/${id}`, {
      params: { user, coll }
    })
  };
}


export function edit(user, coll, id, data) {
  return {
    types: [LIST_EDIT, LIST_EDIT_SUCCESS, LIST_EDIT_FAIL],
    promise: client => client.post(`${apiPath}/list/${id}`, {
      params: { user, coll },
      data
    }),
    data
  };
}


export function editBookmark(user, coll, list, bkId, data) {
  return {
    types: [BOOKMARK_EDIT, BOOKMARK_EDIT_SUCCESS, BOOKMARK_EDIT_FAIL],
    promise: client => client.post(`${apiPath}/bookmark/${bkId}`, {
      params: { user, coll, list },
      data: {
        ...data
      }
    })
  };
}


export function resetBookmarkEdit() {
  return { type: RESET_BOOKMARK_EDIT };
}


export function removeBookmark(user, coll, listId, bookmarkId) {
  return {
    types: [BOOKMARK_REMOVE, BOOKMARK_REMOVE_SUCCESS, BOOKMARK_REMOVE_FAIL],
    promise: client => client.del(`${apiPath}/bookmark/${bookmarkId}`, {
      params: { user, coll, list: listId }
    })
  };
}


export function resetEditState() {
  return { type: LIST_EDITED_RESET };
}


export function saveSort(user, coll, id, order) {
  return {
    types: [LIST_REORDER, LIST_REORDER_SUCCESS, LIST_REORDER_FAIL],
    order,
    promise: client => client.post(`${apiPath}/list/${id}/bookmarks/reorder`, {
      params: { user, coll },
      data: {
        order
      }
    })
  };
}


export function deleteList(user, coll, id) {
  return {
    types: [LIST_REMOVE, LIST_REMOVE_SUCCESS, LIST_REMOVE_FAIL],
    promise: client => client.del(`${apiPath}/list/${id}`, {
      params: { user, coll }
    })
  };
}