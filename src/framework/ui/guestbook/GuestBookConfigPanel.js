import {useGuestBook} from "./GuestBook";
import {Button, Col, Modal, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import EditorPanel from "../editor/EditorPanel";
import {useFormData} from "../editor/FormEditor";
import GuestBookFields from "./GuestBookFields";

export default function GuestBookConfigPanel({extraId, buttonRef}) {

  const {guestBookConfig, setGuestBookConfig} = useGuestBook();
  const {GuestBooks, Extras} = useRestApi();
  const {removeExtraFromPage} = usePageContext();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  /** @type FormDataAPI<GuestBookConfig> */
  const formData = useFormData();

  const [formApi, setFormApi] = useState(null);

  useEffect(() => {
    formData.setData(guestBookConfig);
  }, [guestBookConfig, formData]);

  function onUpdate(data) {
    console.debug(`Updating guest book config...`);
    GuestBooks.insertOrUpdateGuestBook(formData.edits)
      .then(response => {
        console.debug(`Guest book config updated.`);
        formData.update(response);
        setGuestBookConfig(data);
      })
      .catch(error => {
        console.error(`Error updating guest book config.`, error);
      })
  }

  function onDeleteExtra() {
    if (extraId) {
      console.debug(`Deleting extra ${extraId} from page.`);
      Extras.deleteExtra(extraId).then(() => {
        console.debug(`Extra deleted.`);
        removeExtraFromPage(extraId);
      }).catch(error => {
        console.error(`Error deleting extra.`, error);
      })
    }
  }

  function onDeleteGuestBook() {
    GuestBooks.deleteGuestBook(guestBookConfig?.GuestBookID).then(() => {
      console.debug('Guest book deleted.');
      if (extraId) {
        Extras.deleteExtra(extraId).then(() => {
          console.debug('Guest book extra deleted.');
          setShowDeleteConfirmation(false);
          removeExtraFromPage(extraId);
        }).catch(err => console.error('Guest book extra delete error.', err));
      }
    }).catch(err => {
      console.error('Guest book delete error.', err);
    })
  }

  return (<>
    <EditorPanel
      onUpdate={onUpdate}
      onDelete={() => setShowDeleteConfirmation(true)}
      isDataValid={formApi?.isDataValid}
      buttonRef={buttonRef}
      extraButtons={<>
        <Button
          className="me-2"
          variant="secondary"
          size="sm"
          disabled={formApi?.lastCustomField() >= 8}
          onClick={formApi?.addCustomField}
        >
          <span className={'d-none d-sm-block'}>Add a Field</span>
          <span className={'d-block d-sm-none'}>+Field</span>
        </Button>
        {extraId && (
          <Button
            className="me-2"
            variant="secondary"
            size="sm"
            onClick={() => onDeleteExtra()}
          >
            <span className={'d-none d-sm-block'}>Remove from Section</span>
            <span className={'d-block d-sm-none'}>Remove</span>
          </Button>
        )}
      </>}
    >
      <Row><Col><h5>Guest Book Properties</h5></Col></Row>
      <GuestBookFields
        guestBookConfig={guestBookConfig}
        api={setFormApi}
      />
    </EditorPanel>

    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
    >
      <Modal.Header><h5>Delete Guest Book</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete the guest book? This action can't be undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={onDeleteGuestBook}>Delete</Button>
      </Modal.Footer>
    </Modal>

  </>);
}