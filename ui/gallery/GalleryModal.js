import {Modal, ModalBody} from "react-bootstrap";
import GalleryFields from "./GalleryFields";
import FormEditor from "../editor/FormEditor";

export default function GalleryModal(props) {
  return <>
    <Modal show={props.show} onHide={props.onHide} className={'Editor'} size="lg">
      <ModalBody className="Editor">
        <h5>Gallery</h5>
        <FormEditor>
          <GalleryFields {...props} onCancel={props.onHide} />
        </FormEditor>
      </ModalBody>
    </Modal>
  </>;
}