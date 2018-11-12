import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

import { newAutomation, queueAutomation, toggleAutomation, toggleModal } from 'redux/modules/automation';
import { load as loadColl } from 'redux/modules/collection';

import Modal from 'components/Modal';


class Automation extends Component {
  static propTypes = {
    autoQueued: PropTypes.bool,
    collection: PropTypes.object,
    refresh: PropTypes.func,
    createAutomation: PropTypes.func,
    visible: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.refreshHandle = null;
    this.state = {
      addToListModal: false,
      autoHops: 0,
      checkedLists: {},
      autoModal: false,
      listAutoLinks: ''
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.autoQueued && !prevProps.autoQueued) {
      setTimeout(this.closeAutoModal, 1500);
      this.refreshHandle = setInterval(this.refresh, 500);
    }
  }

  componentWillUnmount() {
    if (this.refreshHandle) {
      clearInterval(this.refreshHandle);
    }
  }

  closeAutoModal = () => this.setState({ autoModal: false })

  handleChange = evt => this.setState({ [evt.target.name]: evt.target.value })

  refresh = () => this.props.refresh()

  startAutomation = () => {
    const { collection } = this.props;
    const { autoHops, listAutoLinks } = this.state;
    const links = listAutoLinks.trim().split('\n').map(o => ({ url: o, title: 'Untitled Document' }));
    this.props.createAutomation(collection.get('owner'), collection.get('id'), links, parseInt(autoHops, 10));
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        closeCb={this.props.toggleAutomationModal}
        header={<h4>New Automation</h4>}
        footer={
          <React.Fragment>
            <Button style={{ marginRight: 5 }} onClick={this.closeAutoModal}>Close</Button>
            <Button onClick={this.startAutomation} bsStyle={this.props.autoQueued ? 'success' : 'primary'}>{`Create${this.props.autoQueued ? 'd!' : ''}`}</Button>
          </React.Fragment>
        }>
        <React.Fragment>
          <FormGroup>
            <ControlLabel>Link hops:</ControlLabel>
            <FormControl
              type="text"
              name="autoHops"
              value={this.state.autoHops}
              onChange={this.handleChange} />
          </FormGroup>
          <FormGroup controlId="formControlsTextarea">
            <ControlLabel>Links</ControlLabel>
            <FormControl
              componentClass="textarea"
              name="listAutoLinks"
              value={this.state.listAutoLinks}
              placeholder="http://example.com"
              style={{ minHeight: '200px' }}
              onChange={this.handleChange} />
          </FormGroup>
        </React.Fragment>
      </Modal>
    );
  }
}

const mapStateToProps = ({ app }) => {
  return {
    autoQueued: app.getIn(['automation', 'queued']),
    visible: app.getIn(['automation', 'show'])
  };
};

const mapDispatchToProps = (dispatch, { collection }) => {
  return {
    refresh: () => dispatch(loadColl(collection.get('owner'), collection.get('id'))),
    createAutomation: (user, coll, bookmarks, hops) => {
      let autoId;
      return dispatch(newAutomation(user, coll, hops))
        .then(({ auto }) => { autoId = auto; return dispatch(queueAutomation(user, coll, autoId, bookmarks)); })
        .then(() => dispatch(toggleAutomation('start', user, coll, autoId)))
        .then(() => dispatch(loadColl(user, coll)));
    },
    toggleAutomationModal: () => dispatch(toggleModal())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Automation);
