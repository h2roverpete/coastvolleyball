import {Modal} from "react-bootstrap";
import {useEffect} from "react";
import FormEditor, {useFormData} from "./FormEditor";
import PageFields from "./PageFields";

export default function PageConfigModal(props) {
  return (
    <Modal show={props.show} size={'lg'}>
      <Modal.Body>
        <h5>Page Properties</h5>
        <FormEditor>
          <PageFields {...props} onCancel={props.onHide}/>
        </FormEditor>
      </Modal.Body>
    </Modal>
  )
}