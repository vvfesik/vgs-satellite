import React from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody } from 'reactstrap';
import Icon from 'src/components/atoms/Icon/Icon';
import { getReverseRoute, getForwardRoute } from 'src/redux/utils/quick-integration';
import RouteEntrySummary from 'src/components/organisms/RouteEntry/RouteEntrySummary';
import { ILog } from 'src/redux/interfaces/logs';
import QuickIntegration from 'src/components/organisms/QuickIntegration/QuickIntegration';
import { IRoute, IEntry, IPartialEntry } from 'src/redux/interfaces/routes';
import { createPrecollectRoutes, triggerYamlModal } from 'src/redux/modules/preCollect';
import { pick } from 'lodash';

interface IQuickIntegrationModalProps {
  isReverse: boolean;
  log: ILog;
  url: string;
  preRoute: any;
  preRoutes: any;
  closeModal: () => void;
  showYamlModal: () => void;
  createPrecollectRoutes: (inbound: IRoute, outbound: IRoute) => void;
  triggerYaml: (open: boolean) => void;
}

interface IQuickIntegrationModalState {
  isFilterSaved: boolean;
  ruleEntries: any;
}

function mapStateToProps({ preCollect }: { preCollect: any }) {
  return {
    preRoute: preCollect.route,
    preRoutes: preCollect.routes,
  };
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    createPrecollectRoutes: (inbound: IRoute, outbound: IRoute) => dispatch(createPrecollectRoutes(inbound, outbound)),
    triggerYaml: (open: boolean) => dispatch(triggerYamlModal(open)),
  };
};

export class QuickIntegrationModal extends React.Component<IQuickIntegrationModalProps, IQuickIntegrationModalState> {
  constructor(props: IQuickIntegrationModalProps) {
    super(props);

    this.state = {
      isFilterSaved: false,
      ruleEntries: [],
      routeId: null,
    };
  }

  saveRoutes(ruleEntries: IEntry[]) {
    const parsedUrl = new URL(this.props.url);
    const reverseRoute = getReverseRoute([], parsedUrl);
    const forwardRoute = getForwardRoute([], parsedUrl);

    [reverseRoute, forwardRoute].forEach(route => (
      route.attributes = {
        ...route,
        entries: [
          ...route.entries,
          ...ruleEntries,
        ],
      }
    ));

    this.props.createPrecollectRoutes(
      pick(reverseRoute, ['attributes']),
      pick(forwardRoute, ['attributes']),
    );

    this.setState({
      ruleEntries,
      isFilterSaved: true,
    });

    this.showYamlModal();
  }

  showYamlModal() {
    this.props.triggerYaml(true);
    this.props.closeModal();
  }

  render () {
    const {
      log,
      closeModal,
      url,
      isReverse,
    } = this.props;
    const {
      isFilterSaved,
      ruleEntries,
    } = this.state;

    return (
      <Modal
        isOpen={true}
        size="lg"
        toggle={closeModal}
        data-role="quick-integration-modal"
      >
        <div className="modal-header">
          <h5 className="modal-title">
            {isFilterSaved ? 'Payload Secured' : 'Secure a Payload'}
          </h5>
          <Icon name="times" className="cursor-pointer" onClick={() => closeModal()} />
        </div>
        <ModalBody>
          {isFilterSaved &&
            <div>
              <div className="disable-inputs">
                {ruleEntries.length && ruleEntries.map((entry: IPartialEntry, index: number) =>
                  <div
                    key={entry.id ? entry.id : `${entry.operation}${index}`}
                  >
                    <RouteEntrySummary entry={entry} />
                    <div>Format: {entry.public_token_generator}</div>
                    <div>Storage: {entry.token_manager}</div>
                  </div>,
                )}
              </div>

              <div className="modal-footer mt-3 pb-0">
                {this.props.preRoute || this.props.preRoutes.inbound && (
                  <button
                    className="btn btn-primary"
                    data-role="har-view-yaml"
                    onClick={() => this.showYamlModal()}
                  >
                    View route configuration
                  </button>
                )}
              </div>
            </div>
          }
          {log && !isFilterSaved &&
            <QuickIntegration
              log={log}
              url={url}
              saveRouteHandler={(entriesList: IEntry[]) => this.saveRoutes(entriesList)}
              isReverse={isReverse}
            />
          }
          {!log && !isFilterSaved &&
            <div className="text-center my-4">
              <Icon name="spinner" animation="pulse" className="fa-lg" />
            </div>
          }
        </ModalBody>
      </Modal>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(QuickIntegrationModal);
