import GuestBookFields from "./GuestBookFields";
import CrudButtons from "../editor/CrudButtons";
import {Button, Container, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import {useState} from "react";
import {useFormData} from "../editor/FormEditor";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

export default function GuestBookConfigModal({guestBookConfig, show, onHide, onUpdate, onDelete}) {

  // imports
  const formData = useFormData();
  const {GuestBooks} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  // states
  const [editApi, setEditApi] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  function handleUpdate() {
    GuestBooks.insertOrUpdateGuestBook(formData.edits)
      .then(result => {
        formData.update(result);
        onHide?.();
        onUpdate?.(result);
      })
      .catch(error => showErrorAlert(`Error updating guest book.`, error));
  }

  function handleDelete() {
    GuestBooks.deleteGuestBook(formData.edits.GuestBookID)
      .then(result => {
        setShowDeleteConfirmation(false);
        onHide?.();
        onDelete?.(result);
      })
      .catch(error => showErrorAlert(`Error deleting guest book.`, error));
  }

  function handleCancel() {
    formData.reset();
    onHide?.();
  }

  const extraButtons = <>
    <Button
      size={"sm"}
      variant={"secondary"}
      disabled={editApi?.lastCustomField() > 7}
      onClick={editApi?.addCustomField}
      className="me-2"
    >
      <span className={"d-none d-sm-inline"}>Add a Field</span>
      <span className={"d-inline d-sm-none"}>+ Field</span>
    </Button>
  </>;

  return <>
    <Modal
      show={show}
      onHide={handleCancel}
    >
      <ModalHeader><h5>Edit Guest Book</h5></ModalHeader>
      <ModalBody>
        <GuestBookFields
          guestBookConfig={guestBookConfig}
          api={setEditApi}
        />
      </ModalBody>
      <ModalFooter>
        <Container fluid className={'m-0 p-0'}>
          <CrudButtons
            data={formData.edits}
            keyName={'GuestBookID'}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            onDelete={() => setShowDeleteConfirmation(true)}
            isDataValid={editApi?.isDataValid}
            extraButtons={extraButtons}
          />
        </Container>
      </ModalFooter>
    </Modal>
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
    >
      <Modal.Header><h5>Delete Guest Book</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete the guest book? This action can't be undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
      </Modal.Footer>
    </Modal>
  </>
}