import {useFormData} from "../ui/editor/FormEditor";
import {lazy, Suspense, useEffect, useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {isValidEmail, isValidPassword} from "../util/Validators";
import CrudButtons from "../ui/editor/CrudButtons";
import {useSiteContext} from "../ui/content/Site";
import {useRestApi} from "../api/RestApi";
import {useAuth} from "./AuthProvider";
import {Resource, Permission, ResourcePermissions} from "./Permissions";
import './UserFields.css';

const PhoneNumberField = lazy(() => import("../ui/forms/PhoneNumberField"));

/**
 * Display user fields for editing.
 *
 * @param {NewUserData} data                      Existing user data to edit
 * @param {Number} siteId                         Enforce a particular Site ID for user
 * @param {function()} [onCancel]                 Callback when Cancel button is pressed
 * @param {function({NewUserData})} [onDelete]    Callback when user is deleted
 * @param {function({NewUserData})} [onUpdate]    Callback when user is updated
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserFields({data, siteId, onCancel, onDelete, onUpdate}) {

  const formData = useFormData();
  const {showErrorAlert} = useSiteContext();
  const {Sites, Users} = useRestApi();
  const {hasPermission} = useAuth();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [sites, setSites] = useState();
  const [canAdmin, setCanAdmin] = useState(false);

  useEffect(() => {
    if (data?.UserID) {
      formData.update({
        ...data,
        SiteID: data.SiteID ? data.SiteID : siteId ? siteId : 0, // insert site ID if provided
        Password: undefined
      });
    } else {
      const defaultData = {
        SiteID: siteId ? siteId : 0, // insert site ID if provided
      }
      // create default permissions
      for (const [key, value] of Object.entries(ResourcePermissions)) {
        defaultData[`${key}Permission`] = value[value.length - 1].permission;
      }
      formData.update(defaultData);
    }
  }, [data, siteId]);

  useEffect(() => {
    setCanAdmin(hasPermission(Resource.USERS, Permission.ADMIN));
  }, [hasPermission, setCanAdmin]);

  useEffect(() => {
    if (!sites) {
      Sites.getSites().then((response) => {
        response = response.sort((a, b) => a.SiteName.localeCompare(b.SiteName));
        setSites(response);
      }).catch((error) => showErrorAlert(error));
    }
  }, [sites, Sites, showErrorAlert]);

  function handleUpdate(data) {
    if (data.UserPhone) {
      // remove formatting from phone number
      data.UserPhone = data.UserPhone.replaceAll(/[^0-9+]/g, "");
    }
    Users.insertOrUpdateUser(data).then((result) => {
      onUpdate?.(result);
      formData.update(result);
    }).catch(err => showErrorAlert(err));
  }

  function handleDelete() {
    setShowDeleteConfirmation(false);
    Users.deleteUser(data.UserID).then(() => {
      onDelete?.(data);
    }).catch(err => showErrorAlert(err));
  }

  function isDataValid(data) {
    return data.UserName?.length > 0
      && isValidEmail(data.UserEmail)
      && (isValidPassword(data.Password) || !data.Password)
  }

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
      <Col className={'d-flex align-items-center justify-content-center'}>
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
    {canAdmin && <>
      {!siteId &&
        <Row className={'mt-2'}>
          <Form.Label
            column={'sm'}
            sm={labelCols}
            htmlFor={'SiteID'}
          >
            Site
          </Form.Label>
          <Col>
            <Form.Select
              size={'sm'}
              name={'SiteID'}
              value={formData.edits?.SiteID || 0}
              onChange={(e) => formData.onDataChanged({name: 'SiteID', value: parseInt(e.target.value)})}
            >
              <option value={0}>All Sites</option>
              {sites?.map((site) =>
                <option key={site.SiteID} value={site.SiteID}>
                  {site.SiteName}
                </option>
              )}
            </Form.Select>
          </Col>
        </Row>
      }
      {Object.entries(ResourcePermissions).map((entry) =>
        <Row className={'mt-2'} key={entry[0]}>
          <Form.Label
            column={'sm'}
            sm={labelCols}
            htmlFor={`${entry[0]}Permission`}
          >
            {entry[0]} Permission
          </Form.Label>
          <Col className={'d-flex align-items-center justify-content-center'}>
            <Form.Select
              size={'sm'}
              name={`${entry[0]}Permission`}
              value={formData.edits?.[`${entry[0]}Permission`] || ''}
              onChange={(e) => formData.onDataChanged({name: `${entry[0]}Permission`, value: e.target.value})}
            >
              {entry[1].map((option) =>
                <option key={option.permission} value={option.permission}>
                  {option.description}
                </option>
              )}
            </Form.Select>
          </Col>
        </Row>
      )}
    </>}
    <CrudButtons
      data={formData.edits}
      type="User"
      keyName={'UserID'}
      onUpdate={handleUpdate}
      onCancel={onCancel}
      onDelete={onDelete ? () => setShowDeleteConfirmation(true) : undefined}
      isDataValid={isDataValid}
    />
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
      size={'sm'}
    >
      <Modal.Body>
        <h5>Delete User</h5>
        <div>Are you sure you want to delete {formData.edits?.UserName}? This action can't be undone.</div>
        <div className='mt-2 d-flex justify-content-end gap-2'>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>
  </Suspense>);
}