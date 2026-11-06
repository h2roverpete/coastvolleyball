import {Modal, ModalBody} from "react-bootstrap";
import LivestreamFields from "./LivestreamFields";

/**
 * Modal for editing SMS campaign data.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function LivestreamModal(props) {

  return <>
    <Modal show={props.show} onHide={props.onHide} className={'Editor'} size="md">
      <ModalBody className="Editor">
        <h5>Livestream</h5>
        <LivestreamFields {...props} onCancel={props.onHide} />
      </ModalBody>
    </Modal>
  </>;
}