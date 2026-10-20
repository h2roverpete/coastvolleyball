import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import {useEffect} from "react";
import EmailField from "../forms/EmailField";
import PhoneNumberField from "../forms/PhoneNumberField";

/**
 * Display the UI for editing an SMS subscriber.
 * Requires an enclosing <FormEditor> tag to provide form data.
 *
 * @param subscriber {SMSSubscriberData|null}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSubscriberFields({subscriber}) {

  const formData = useFormData();

  useEffect(() => {
    formData.update(subscriber);
  }, [subscriber]);

  const labelCols = 3;
  return <>
    <Row>
      <Form.Label
        column={true}
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
        column={true}
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
        column={true}
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
        column={true}
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
  </>
}