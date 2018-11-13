import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, FormGroup, ControlLabel, FormControl, Radio } from 'react-bootstrap';

import { apiFetch } from 'helpers/utils';

import { newAutomation, queueAutomation, toggleAutomation, toggleModal } from 'redux/modules/automation';
import { load as loadColl } from 'redux/modules/collection';

import Modal from 'components/Modal';

import './style.scss';


class Automation extends Component {
  static propTypes = {
    active: PropTypes.bool,
    autoId: PropTypes.string,
    autoQueued: PropTypes.bool,
    collection: PropTypes.object,
    refresh: PropTypes.func,
    createAutomation: PropTypes.func,
    visible: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.refreshHandle = null;
    this.pingHandle = null;
    this.state = {
      addToListModal: false,
      autoHops: 0,
      autoModal: false,
      checkedLists: {},
      listAutoLinks: '',
      scope: 'single-domain',
      workers: []
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.autoQueued && !prevProps.autoQueued) {
      // setTimeout(this.closeAutoModal, 1500);
      this.refreshHandle = setInterval(this.refresh, 2500);

      this.pingHandle = setInterval(this.ping, 5000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshHandle);
    clearInterval(this.pingHandle);
  }

  closeAutoModal = () => this.setState({ autoModal: false })

  handleChange = evt => this.setState({ [evt.target.name]: evt.target.value })

  ping = () => {
    const { collection } = this.props;

    apiFetch(`/auto/${this.props.autoId}?user=${collection.get('owner')}&coll=${collection.get('id')}`)
      .then(res => res.json())
      .then((data) => {
        if (data.auto.browsers.length) {
          clearInterval(this.pingHandle);
          this.setState({ workers: data.auto.browsers });
        }
      });
  }

  refresh = () => this.props.refresh()

  startAutomation = () => {
    const { collection } = this.props;
    const { autoHops, listAutoLinks, scope } = this.state;
    const links = listAutoLinks.trim().split('\n');
    this.props.createAutomation(collection.get('owner'), collection.get('id'), links, parseInt(autoHops, 10), scope);
  }

  render() {
    const { scope } = this.state;

    return (
      <Modal
        visible={this.props.visible}
        closeCb={this.props.toggleAutomationModal}
        header={<h4>New Automation</h4>}
        footer={
          <React.Fragment>
            <Button style={{ marginRight: 5 }} onClick={this.closeAutoModal}>Close</Button>
            {
              this.props.active &&
                <Button style={{ marginRight: 5 }} onClick={this.closeAutoModal}>Stop Automation</Button>
            }
            <Button onClick={this.startAutomation} disabled={this.props.autoQueued} bsStyle={this.props.autoQueued ? 'success' : 'primary'}>{`Create${this.props.autoQueued ? 'd!' : ''}`}</Button>
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
          <FormGroup bsClass="form-group automation-scope">
            <ControlLabel>Scope:</ControlLabel>
            <Radio name="scope" onChange={this.handleChange} value="single-domain" checked={scope === 'single-domain'} inline>
              Single Domain
            </Radio>
            <Radio name="scope" onChange={this.handleChange} value="same-domain" checked={scope === 'same-domain'} inline>
              Same Domain
            </Radio>
            <Radio name="scope" onChange={this.handleChange} value="all-links" checked={scope === 'all-links'} inline>
              All Links
            </Radio>
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

          {
            this.state.workers.length > 0 &&
              <FormGroup>
                <ControlLabel>Automation Workers:</ControlLabel>
                <FormControl.Static>
                  {
                    this.state.workers.map((worker, idx) => <a href={`http://${window.location.hostname}:9020/attach/${worker}`} key={worker} target="_blank">Worker {idx + 1}</a>)
                  }
                </FormControl.Static>
              </FormGroup>
          }

        </React.Fragment>
      </Modal>
    );
  }
}

const mapStateToProps = ({ app }) => {
  return {
    active: app.getIn(['automation', 'active']),
    autoId: app.getIn(['automation', 'autoId']),
    autoQueued: app.getIn(['automation', 'queued']),
    visible: app.getIn(['automation', 'show'])
  };
};

const mapDispatchToProps = (dispatch, { collection }) => {
  return {
    refresh: () => dispatch(loadColl(collection.get('owner'), collection.get('id'))),
    createAutomation: (user, coll, bookmarks, hops, scope) => {
      let autoId;
      return dispatch(newAutomation(user, coll, hops, scope))
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
