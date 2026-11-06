import SmsSubscriberFields from "./SmsSubscriberFields";
import {Modal, ModalBody} from "react-bootstrap";

/**
 * Display a modal dialog with subscriber data.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSubscriberModal(props) {
  return <>
    <Modal show={props.show} onHide={props.onHide}>
      <ModalBody>
        <h5>Subscriber Details</h5>
        <SmsSubscriberFields {...props} onCancel={props.onHide} />
      </ModalBody>
    </Modal>
  </>
}