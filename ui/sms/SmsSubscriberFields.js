import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import EmailField from "../forms/EmailField";
import PhoneNumberField from "../forms/PhoneNumberField";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import CrudButtons from "../editor/CrudButtons";
import {isValidPhoneNumber, isValidEmail} from "../../util/Validators";

/**
 * Display the UI for editing an SMS subscriber.
 * Requires an enclosing <FormEditor> tag to provide form data.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSubscriberFields({subscriber, onUpdate, onDelete, onCancel}) {

  const formData = useFormData();
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    formData.update(subscriber);
  }, [subscriber]);

  function isDataValid() {
    return formData.edits.SubscriberName?.length
      && (!formData.edits.SubscriberEmail || isValidEmail(formData.edits.SubscriberEmail))
      && (!formData.edits.SubscriberMobileNumber || isValidPhoneNumber(formData.edits.SubscriberMobileNumber));
  }

  function handleUpdate(data) {
    setUpdating(true);
    data.SubscriberMobileNumber = data.SubscriberMobileNumber?.replace(/[^/+0-9]/g, '');
    SMS.insertOrUpdateSmsSubscriber(data).then((result) => {
      onUpdate?.(result);
      setUpdating(false);
    }).catch((error) => {
      showErrorAlert(error);
      setUpdating(false);
    })
  }

  function handleDelete() {
    setShowDeleteConfirmation(false);
    setDeleting(true);
    SMS.deleteSmsSubscriber(subscriber.SMSCampaignID, subscriber.SubscriberID).then((result) => {
      onDelete?.(result);
      setDeleting(false);
    }).catch((error) => {
      showErrorAlert(error);
      setDeleting(false);
    })
  }

  const labelCols = 3;
  return <>
    <Row>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'SubscriberName'}
      >
        Name
      </Form.Label>
      <Col sm={7}>
        <Form.Control
          id={'SubscriberName'}
          size={'sm'}
          isValid={formData.isTouched('SubscriberName') && formData.edits.SubscriberName?.length > 0}
          isInvalid={formData.isTouched('SubscriberName') && !(formData.edits.SubscriberName?.length > 0)}
          value={formData.edits?.SubscriberName || ''}
          onChange={(e) => formData.onDataChanged({name: 'SubscriberName', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'SubscriberMobileNumber'}
      >
        Mobile Number
      </Form.Label>
      <Col sm={7}>
        <PhoneNumberField
          name={'SubscriberMobileNumber'}
          id={'SubscriberMobileNumber'}
          size={'sm'}
          value={formData.edits?.SubscriberMobileNumber || ''}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'SubscriberEmail'}
      >
        Email
      </Form.Label>
      <Col sm={7}>
        <EmailField
          name={'SubscriberEmail'}
          size={'sm'}
          value={formData.edits?.SubscriberEmail || ''}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
      >

      </Form.Label>
      <Col sm={7}>
        <Form.Check
          id={'Unsubscribed'}
          name={'Unsubscribed'}
          checked={formData.edits?.Unsubscribed === true || false}
          onChange={(e) => formData.onDataChanged({name: 'Unsubscribed', value: e.target.checked})}
          label={'Unsubscribed'}
        />
      </Col>
    </Row>
    <CrudButtons
      size={'sm'}
      data={formData.edits}
      keyName={'SubscriberID'}
      type={'Subscriber'}
      onUpdate={handleUpdate}
      onCancel={onCancel}
      onDelete={() => setShowDeleteConfirmation(true)}
      isDataValid={isDataValid}
      updating={updating}
      deleting={deleting}
    />
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
        <div className="mt-3 d-flex gap-2 justify-content-end align-items-center">
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        </div>
      </Modal.Body>
    </Modal>
  </>
}