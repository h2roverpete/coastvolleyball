import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import EmailField from "../forms/EmailField";
import PhoneNumberField from "../forms/PhoneNumberField";
import CrudButtons from "../editor/CrudButtons";
import {isValidPhoneNumber, isValidEmail} from "../../util/Validators";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

/**
 * Display the UI for editing an SMS subscriber.
 * Requires an enclosing <FormEditor> tag to provide form data.
 *
 * @param entry {SMSSubscriberData|null}
 * @param {function({SMSWhitelistEntry})} onUpdate
 * @param {function({SMSWhitelistEntry})} onAdd
 * @param {function({SMSWhitelistEntry})} onDelete
 * @param {function()} onCancel
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsWhitelistEntryFields({entry, onAdd, onDelete, onUpdate, onCancel}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    formData.update(entry);
  }, [entry]);

  /**
   * Handle validation event from CrudButtons.
   */
  function isDataValid() {
    return formData.edits.Name?.length
      && (formData.edits.Phone?.length > 0 || formData.edits.Email?.length > 0)
      && (!formData.edits.Email || isValidEmail(formData.edits.Email))
      && (!formData.edits.Phone || isValidPhoneNumber(formData.edits.Phone));
  }

  /**
   * Handle update event from CrudButtons.
   */
  function handleUpdate(data) {
    data.Phone = data.Phone?.replace(/[^/+[0-9]/g, "");
    SMS.insertOrUpdateSmsWhitelistEntry(data).then((result) => {
      if (!data.WhitelistEntryID && result.WhitelistEntryID) {
        onAdd(result);
      } else {
        onUpdate(result);
      }
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  /**
   * Handle cancel event from CrudButtons.
   */
  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
  }

  /**
   * Handle delete event from CrudButtons.
   */
  function handleDelete() {
    setShowDeleteConfirmation(false);
    SMS.deleteSmsWhitelistEntry(entry.SMSCampaignID, entry.WhitelistEntryID).then((result) => {
      onDelete(result);
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  const labelCols = 3;
  return <>
    <Row>
      <Form.Label
        column={true}
        sm={labelCols}
        htmlFor={'Name'}
      >
        Name
      </Form.Label>
      <Col sm={7}>
        <Form.Control
          id={'Name'}
          size={'sm'}
          isValid={formData.isTouched('Name') && formData.edits.Name?.length > 0}
          isInvalid={formData.isTouched('Name') && !(formData.edits.Name?.length > 0)}
          value={formData.edits?.Name || ''}
          onChange={(e) => formData.onDataChanged({name: 'Name', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={true}
        sm={labelCols}
        htmlFor={'Phone'}
      >
        Mobile Number
      </Form.Label>
      <Col sm={7}>
        <PhoneNumberField
          name={'Phone'}
          id={'Phone'}
          size={'sm'}
          value={formData.edits?.Phone || ''}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={true}
        sm={labelCols}
        htmlFor={'Email'}
      >
        Email
      </Form.Label>
      <Col sm={7}>
        <EmailField
          name={'Email'}
          size={'sm'}
          value={formData.edits?.Email || ''}
        />
      </Col>
    </Row>

    <CrudButtons
      data={formData.edits}
      keyName={'WhitelistEntryID'}
      type={'Entry'}
      onUpdate={handleUpdate}
      onCancel={handleCancel}
      onDelete={() => setShowDeleteConfirmation(true)}
      isDataValid={isDataValid}
    />

    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor mt-3'}
      size={'sm'}
    >
      <Modal.Body>
        <h5>Delete Whitelist Entry</h5>
        <div>Are you sure you want to delete the whitelist entry for {entry?.Name}? This action can't be
          undone.
        </div>
        <div className={'mt-4 d-flex flex-row justify-content-end gap-2'}>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>

  </>
}