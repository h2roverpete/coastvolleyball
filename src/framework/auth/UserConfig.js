import {useFormData} from "../ui/editor/FormEditor";
import {useEffect, useState} from "react";
import {Col, Form, Row} from "react-bootstrap";
import CrudButtons from "../ui/editor/CrudButtons";
import {useRestApi} from "../api/RestApi";
import {Resource, ResourcePermissions} from "./Permissions";
import {isValidEmail} from "../util/Validators";
import PhoneNumberField from "../ui/forms/PhoneNumberField";

export default function UserConfig({className, style, userData, onCancel, onUpdate, onDelete}) {

  const {Users, Sites} = useRestApi();

  const [sites, setSites] = useState([]);
  useEffect(() => {
    Sites.getSites()
      .then(siteList => setSites(siteList.sort((a, b) => a.SiteName.localeCompare(b.SiteName))));
  }, [Sites, setSites]);

  const formData = useFormData();
  useEffect(() => {
    formData.setData(userData);
  }, [userData, formData]);

  function handleUpdate(data) {
    const user = {...data};
    Users.insertOrUpdateUser(user)
      .then(result => onUpdate?.(result))
      .catch((error) => console.error(`Error updating user.`,error));
  }

  function handleDelete(data) {
    Users.deleteUser(data.UserID)
      .then(result => onDelete?.(result))
      .catch((error) => console.error(`Error deleting user.`,error));
  }

  function handleCancel() {
    onCancel?.();
  }

  function isDataValid(data) {
    return data.UserName?.length > 0
      && (isValidPassword(data.Password) || data.UserID > 0)
      && data.PagePermission
      && data.SitePermission
      && data.GalleryPermission
      && data.GuestBookPermission
      && data.UserPermission
  }

  const labelCols = 5;
  return (
    <div
      className={`UserConfig ${className ? className : ''}`}
      style={style}
    >
      <h5>User Properties</h5>
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
            isValid={formData.isTouched('Password') && isValidPassword(formData.edits.Password)}
            isInvalid={formData.isTouched('Password') && !isValidPassword(formData.edits.Password)}
            value={formData.edits?.Password || ''}
            onChange={(e) => formData.onDataChanged({name: 'Password', value: e.target.value})}
          />
        </Col>
      </Row>
      <Row className={'mt-4'}>
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
      <Row className={'mt-4'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'SiteID'}
        >
          Site
        </Form.Label>
        <Col>
          <Form.Select
            size={'sm'}
            id={'SiteID'}
            value={formData.edits?.SiteID || ''}
            onChange={(e) => formData.onDataChanged({name: 'SiteID', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            <option value={0}>All Sites</option>
            {sites?.map((site) => (
              <option key={site.SiteID} value={site.SiteID}>{site.SiteName}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-4'}>
        <Form.Label column={'sm'} sm={labelCols} className={'required'} htmlFor={'SitePermission'}>
          Site Permission
        </Form.Label>
        <Col>
          <Form.Select
            name={'SitePermission'}
            id={'SitePermission'}
            size={'sm'}
            value={formData.edits.SitePermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'SitePermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.SITE]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'PagePermission'}
        >
          Page Permission
        </Form.Label>
        <Col>
          <Form.Select
            name={'PagePermission'}
            id={'PagePermission'}
            size={'sm'}
            value={formData.edits.PagePermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'PagePermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.PAGE]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'GalleryPermission'}
        >
          Gallery Permission
        </Form.Label>
        <Col>
          <Form.Select
            name={'GalleryPermission'}
            id={'GalleryPermission'}
            size={'sm'}
            value={formData.edits.GalleryPermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'GalleryPermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.GALLERY]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'GuestBookPermission'}
        >
          Guest Book Permission
        </Form.Label>
        <Col>
          <Form.Select
            name={'GuestBookPermission'}
            size={'sm'}
            value={formData.edits.GuestBookPermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'GuestBookPermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.GUESTBOOK]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'UserPermission'}
        >
          User Management
        </Form.Label>
        <Col>
          <Form.Select
            name={'UserPermission'}
            size={'sm'}
            value={formData.edits.UserPermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'UserPermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.USERS]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Form.Label
          column={'sm'}
          sm={labelCols}
          className={'required'}
          htmlFor={'SmsPermission'}
        >
          SMS Campaigns
        </Form.Label>
        <Col>
          <Form.Select
            name={'SmsPermission'}
            size={'sm'}
            value={formData.edits.SmsPermission || ''}
            onChange={(e) => formData.onDataChanged({name: 'SmsPermission', value: e.target.value})}
          >
            <option value={''}>(select)</option>
            {[...ResourcePermissions[Resource.SMS]].reverse().map(item => (
              <option key={item.permission} value={item.permission}>{item.description}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      <CrudButtons
        data={userData}
        keyName={'UserID'}
        type={'User'}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onCancel={handleCancel}
        isDataValid={isDataValid}
      />
    </div>
  );
}

export function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,40}$/.test(password);
}