import GuestBookFields from "./GuestBookFields";
import {Modal, ModalBody} from "react-bootstrap";
import FormEditor from "../editor/FormEditor";

export default function GuestBookConfigModal(props) {
  return <Modal
    show={props.show}
    onHide={props.onHide}
  >
    <ModalBody>
      <h5>Edit Guest Book</h5>
      <FormEditor>
        <GuestBookFields {...props} onCancel={props.onHide}/>
      </FormEditor>
    </ModalBody>
  </Modal>
}