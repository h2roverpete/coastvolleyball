import {useAuth} from "./AuthProvider";
import {useFormData} from "../ui/editor/FormEditor";
import {lazy, Suspense, useEffect} from "react";
import {Col, Form, Row} from "react-bootstrap";
import {isValidEmail, isValidPassword} from "../util/Validators";

const PhoneNumberField = lazy(()=>import("../ui/forms/PhoneNumberField"));

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserFields() {
  const {currentUser} = useAuth();
  const formData = useFormData();

  useEffect(() => {
    if (currentUser) {
      formData.setData({
        UserID: currentUser.UserID,
        UserName: currentUser.UserName,
        UserEmail: currentUser.UserEmail,
        UserPhone: currentUser.UserPhone,
      });
    }
  }, [currentUser, formData]);

  const labelCols = 3;
  return (<Suspense>
    <Row className={'mt-4'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'UserName'}
      >
        User Name
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          name={'UserName'}
          isValid={formData.isTouched('UserName') && formData.edits.UserName?.length > 0}
          isInvalid={formData.isTouched('UserName') && !(formData.edits.UserName?.length > 0)}
          value={formData.edits?.UserName || ''}
          onChange={(e) => formData.onDataChanged({name: 'UserName', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={'required'}
        htmlFor={'UserEmail'}
      >
        Email
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          name={'UserEmail'}
          isValid={formData.isTouched('UserEmail') && isValidEmail(formData.edits.UserEmail)}
          isInvalid={formData.isTouched('UserEmail') && !isValidEmail(formData.edits.UserEmail)}
          value={formData.edits?.UserEmail || ''}
          onChange={(e) => formData.onDataChanged({name: 'UserEmail', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        className={formData.edits.UserID ? '' : 'required'}
        htmlFor={'Password'}
      >
        {formData.edits.UserID ? 'Change ' : ''}Password
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          id={'Password'}
          type='password'
          autoComplete={'new-password'}
          isValid={formData.isTouched('Password') && isValidPassword(formData.edits.Password)}
          isInvalid={formData.isTouched('Password') && !isValidPassword(formData.edits.Password)}
          value={formData.edits?.Password || ''}
          onChange={(e) => formData.onDataChanged({name: 'Password', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'UserPhone'}
      >
        Phone Number
      </Form.Label>
      <Col sm={7}>
        <PhoneNumberField
          size={'sm'}
          name={'UserPhone'}
          id={'UserPhone'}
          value={formData.edits?.UserPhone || ''}
          onChange={(data) => formData.onDataChanged(data)}
        />
      </Col>
    </Row>
  </Suspense>);
}