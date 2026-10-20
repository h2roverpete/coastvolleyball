import {useFormData} from "../editor/FormEditor";
import SmsSubscriberFields from "./SmsSubscriberFields";
import {Button, Container, Modal, ModalBody} from "react-bootstrap";
import CrudButtons from "../editor/CrudButtons";
import {useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {isValidEmail, isValidPhoneNumber} from "../../util/Validators";
import {useSiteContext} from "../content/Site";

/**
 * Display a modal dialog with subscriber data.
 *
 * @param {SMSSubscriberData} subscriber
 * @param {Boolean} show
 * @param {function()} onHide
 * @param {function({SMSSubscriberData})} onUpdate
 * @param {function({SMSSubscriberData})} onAdd
 * @param {function({SMSSubscriberData})} onDelete
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSubscriberModal({subscriber, show, onHide, onUpdate, onAdd, onDelete}) {

  const formData = useFormData();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();


  /**
   * Handle validation event from CrudButtons.
   */
  function isDataValid() {
    return formData.edits.SubscriberName?.length
      && (!formData.edits.SubscriberEmail || isValidEmail(formData.edits.SubscriberEmail))
      && (!formData.edits.SubscriberMobileNumber || isValidPhoneNumber(formData.edits.SubscriberMobileNumber));
  }

  /**
   * Handle update event from CrudButtons.
   */
  function handleUpdate(data) {
    data.SubscriberMobileNumber = data.SubscriberMobileNumber?.replace(/[^/+0-9]/g, '');
    SMS.insertOrUpdateSmsSubscriber(data).then((result) => {
      if (!data.SubscriberID && result.SubscriberID) {
        onAdd?.(result);
      } else {
        onUpdate?.(result);
      }
      onHide();
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  /**
   * Handle cancel event from CrudButtons.
   */
  function handleCancel() {
    onHide();
  }

  /**
   * Handle delete event from CrudButtons.
   */
  function handleDelete() {
    setShowDeleteConfirmation(false);
    SMS.deleteSmsSubscriber(subscriber.SMSCampaignID, subscriber.SubscriberID).then((result) => {
      onDelete?.(result);
      onHide();
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  return <>
    <Modal show={show} onHide={handleCancel} className={'Editor'}>
      <ModalBody>
        <Container fluid className="p-0 m-0">
          <h5>Subscriber Details</h5>
          <SmsSubscriberFields subscriber={subscriber}/>
          <CrudButtons
            data={formData.edits}
            keyName={'SubscriberID'}
            type={'Subscriber'}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            onDelete={() => setShowDeleteConfirmation(true)}
            isDataValid={isDataValid}
          />
        </Container>
      </ModalBody>
    </Modal>
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
      size={'sm'}
    >
      <Modal.Body>
        <h5>Delete Subscriber</h5>
        <div>Are you sure you want to delete subscriber '{subscriber?.SubscriberName}'? This action can't be
          undone.
        </div>
        <div className="mt-3 d-flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>
  </>
}