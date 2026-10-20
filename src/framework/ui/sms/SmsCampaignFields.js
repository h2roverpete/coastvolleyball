import FormEditor, {useFormData} from "../editor/FormEditor";
import {useEffect, useState} from "react";
import {Accordion, Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi"
import {useSiteContext} from "../content/Site";
import EmailField from "../forms/EmailField";
import './SmsCampaignFields.css'
import SmsWhitelist from "./SmsWhitelist";
import CrudButtons from "../editor/CrudButtons";
import {isValidEmail} from "../../util/Validators";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignFields({campaign, onAdd, onUpdate, onDelete, onCancel}) {

  const {Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();
  const {SMS} = useRestApi();

  const [sites, setSites] = useState();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (!sites) {
      Sites.getSites().then((response) => {
        response = response.sort((a, b) => a.SiteName.localeCompare(b.SiteName));
        setSites(response);
      }).catch((error) => showErrorAlert(error));
    }
  }, [sites, Sites, showErrorAlert]);

  useEffect(() => {
    // TODO fix dependency loop here
    if (campaign && campaign.SandboxMode === undefined) {
      campaign.SandboxMode = true;
    }
    formData.update(campaign);
  }, [campaign])

  /**
   * Handle validation event from CrudButtons.
   */
  function isDataValid() {
    return formData.edits.CampaignName?.length > 0
      && formData.edits.SiteID > 0
      && isValidEmail(formData.edits.CampaignAdminEmail)
      && (formData.edits.TextCampaign || formData.edits.EmailCampaign)
  }

  /**
   * Handle update event from CrudButtons.
   */
  function handleUpdate() {
    SMS.insertOrUpdateSmsCampaign(formData.edits).then((result) => {
      formData.update(result);
      if (campaign.SMSCampaignID > 0) {
        onUpdate?.(result);
      } else {
        onAdd?.(result);
      }
    }).catch(error => {
      showErrorAlert(error);
    })
  }

  /**
   * Handle cancel event from CrudButtons.
   */
  function handleCancel() {
    onCancel();
  }

  function confirmDelete() {
    setShowDeleteConfirmation(true);
  }

  /**
   * Handle delete event from CrudButtons.
   */
  function handleDelete() {
    setShowDeleteConfirmation(false);
    SMS.deleteSmsCampaign(formData.edits.SMSCampaignID).then((result) => {
      onDelete(result);
    });
  }

  const labelCols = 2;
  return <>
    <Accordion defaultActiveKey={'config'}>
      <Accordion.Item eventKey={'config'}>
        <Accordion.Header>
          Configuration
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignName'}
            >
              Name
            </Form.Label>
            <Col>
              <Form.Control
                size={'sm'}
                name={'CampaignName'}
                isValid={formData.isTouched('CampaignName') && formData.edits.CampaignName?.length > 0}
                isInvalid={formData.isTouched('CampaignName') && !(formData.edits.CampaignName?.length > 0)}
                value={formData.edits?.CampaignName || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignName', value: e.target.value})}
              />
            </Col>
          </Row>
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
                onChange={(e) => formData.onDataChanged({name: 'SiteID', value: e.target.value})}
              >
                <option value={0}>(select a site)</option>
                {sites?.map((site) =>
                  <option key={site.SiteID} value={site.SiteID}>
                    {site.SiteName}
                  </option>
                )}
              </Form.Select>
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignAdminEmail'}
            >
              Admin Email
            </Form.Label>
            <Col className={'col-sm-6'}>
              <EmailField
                size={'sm'}
                name={'CampaignAdminEmail'}
                value={formData.edits?.CampaignAdminEmail || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignAdminEmail', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
            >
              Message Formats
            </Form.Label>
            <Col className={'col-sm-6'}>
              <Form.Check
                name={'TextCampaign'}
                checked={formData.edits?.TextCampaign === true}
                onChange={(e) => formData.onDataChanged({name: 'TextCampaign', value: e.target.checked})}
                label={'Text Message'}
                inline
                className={'form-control-sm'}
              />
              <Form.Check
                name={'EmailCampaign'}
                checked={formData.edits?.EmailCampaign === true}
                onChange={(e) => formData.onDataChanged({name: 'EmailCampaign', value: e.target.checked})}
                label={'Email From'}
                inline
                className={'form-control-sm'}
              />
              <EmailField
                size={'sm'}
                name={'CampaignEmail'}
                disabled={!formData.edits?.EmailCampaign}
                value={formData.edits?.CampaignEmail || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignEmail', value: e.target.value})}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={'sandbox'}>
        <Accordion.Header>
          Sandbox
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className={'mt-0'}>
            <Col className={'d-flex align-items-top gap-3'}>
              <Form.Label
                className={'p-1'}
                column={'sm'}
                sm={'auto'}
                htmlFor={'CampaignMode'}
              >
                Campaign Mode:
              </Form.Label>
              <Form.Check
                inline
                type={'radio'}
                id={'CampaignMode'}
                name={'CampaignMode'}
                label={'Sandbox'}
                onChange={() => formData.onDataChanged({name: 'SandboxMode', value: true})}
                checked={formData.edits?.SandboxMode === true}
              />
              <Form.Check
                inline
                type={'radio'}
                id={'CampaignMode'}
                name={'CampaignMode'}
                label={'Production'}
                onChange={() => formData.onDataChanged({name: 'SandboxMode', value: false})}
                checked={formData.edits?.SandboxMode === false}
              />
            </Col>
          </Row>
          <Row hidden={formData.edits.SandboxMode}>
            <Col className={'text-light mt-1 ps-3'}>
              In Production Mode, all emails and phone numbers are active for sending.
            </Col>
          </Row>
          <Row hidden={!formData.edits.SandboxMode}>
            <Col className={'text-light ps-3 mt-1'}>
              In Sandbox Mode, emails and SMS messages will only be sent to members of the whitelist below.
            </Col>
          </Row>
          <Row hidden={!formData.edits.SandboxMode}>
            <Col>
              <FormEditor>
                <SmsWhitelist campaignId={formData.edits.SMSCampaignID}/>
              </FormEditor>
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={'numbers'}>
        <Accordion.Header>
          Numbers
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignOriginationIdentity'}
            >
              Origination
            </Form.Label>
            <Col className={'col-sm-4'}>
              <Form.Control
                size={'sm'}
                name={'CampaignOriginationIdentity'}
                isValid={formData.isTouched('CampaignOriginationIdentity') && formData.edits.CampaignOriginationIdentity?.length > 0}
                isInvalid={formData.isTouched('CampaignOriginationIdentity') && !(formData.edits.CampaignOriginationIdentity?.length > 0)}
                value={formData.edits?.CampaignOriginationIdentity || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignOriginationIdentity', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignOriginationIsRCS'}
            >
              Type
            </Form.Label>
            <Col className={'col-sm-4 d-flex'}>
              <Form.Check
                type={'radio'}
                name={'CampaignOriginationIsRCS'}
                value={0}
                inline
                checked={formData.edits.CampaignOriginationIsRCS !== 1}
                label={'SMS'}
                onChange={() => formData.onDataChanged({name: 'CampaignOriginationIsRCS', value: 0})}
              />
              <Form.Check
                type={'radio'}
                name={'CampaignOriginationIsRCS'}
                value={1}
                inline
                checked={formData.edits.CampaignOriginationIsRCS === 1}
                label={'RCS'}
                onChange={() => formData.onDataChanged({name: 'CampaignOriginationIsRCS', value: 1})}
              />
            </Col>
          </Row>
          <Row className={'mt-1'} hidden={formData.edits.CampaignOriginationIsRCS !== 1}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignFallbackOriginationIdentity'}
            >
              Fallback
            </Form.Label>
            <Col className={'col-sm-4'}>
              <Form.Control
                size={'sm'}
                name={'CampaignFallbackOriginationIdentity'}
                isValid={formData.isTouched('CampaignFallbackOriginationIdentity') && formData.edits.CampaignFallbackOriginationIdentity?.length > 0}
                isInvalid={formData.isTouched('CampaignFallbackOriginationIdentity') && !(formData.edits.CampaignFallbackOriginationIdentity?.length > 0)}
                value={formData.edits?.CampaignFallbackOriginationIdentity || ''}
                onChange={(e) => formData.onDataChanged({
                  name: 'CampaignFallbackOriginationIdentity',
                  value: e.target.value
                })}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={2}
              htmlFor={'CampaignAdminOriginationIdentity'}
            >
              Admin Origination
            </Form.Label>
            <Col className={'col-sm-4'}>
              <Form.Control
                size={'sm'}
                name={'CampaignAdminOriginationIdentity'}
                isValid={formData.isTouched('CampaignAdminOriginationIdentity') && formData.edits.CampaignAdminOriginationIdentity?.length > 0}
                isInvalid={formData.isTouched('CampaignAdminOriginationIdentity') && !(formData.edits.CampaignAdminOriginationIdentity?.length > 0)}
                value={formData.edits?.CampaignAdminOriginationIdentity || ''}
                onChange={(e) => formData.onDataChanged({
                  name: 'CampaignAdminOriginationIdentity',
                  value: e.target.value
                })}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignSnsTopicArn'}
            >
              Reply Topic ARN
            </Form.Label>
            <Col>
              <Form.Control
                size={'sm'}
                name={'CampaignSnsTopicArn'}
                isValid={formData.isTouched('CampaignSnsTopicArn') && formData.edits.CampaignName?.length > 0}
                isInvalid={formData.isTouched('CampaignSnsTopicArn') && !(formData.edits.CampaignName?.length > 0)}
                value={formData.edits?.CampaignSnsTopicArn || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignSnsTopicArn', value: e.target.value})}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={'signup'}>
        <Accordion.Header>
          Signup
        </Accordion.Header>
        <Accordion.Body className="p-2">
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignDescription'}
            >
              Description
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'CampaignDescription'}
                isValid={formData.isTouched('CampaignDescription') && formData.edits.CampaignDescription?.length > 0}
                isInvalid={formData.isTouched('CampaignDescription') && !(formData.edits.CampaignDescription?.length > 0)}
                value={formData.edits?.CampaignDescription || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignDescription', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignAgreement'}
            >
              SMS Agreement Checkbox
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={8}
                size={'sm'}
                name={'CampaignAgreement'}
                isValid={formData.isTouched('CampaignAgreement') && formData.edits.CampaignAgreement?.length > 0}
                isInvalid={formData.isTouched('CampaignAgreement') && !(formData.edits.CampaignAgreement?.length > 0)}
                value={formData.edits?.CampaignAgreement || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignAgreement', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignTermsAndConditions'}
            >
              Terms &amp; Conditions Checkbox
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={8}
                size={'sm'}
                name={'CampaignTermsAndConditions'}
                isValid={formData.isTouched('CampaignTermsAndConditions') && formData.edits.CampaignTermsAndConditions?.length > 0}
                isInvalid={formData.isTouched('CampaignTermsAndConditions') && !(formData.edits.CampaignTermsAndConditions?.length > 0)}
                value={formData.edits?.CampaignTermsAndConditions || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignTermsAndConditions', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignSubmitButton'}
            >
              Submit Button
            </Form.Label>
            <Col className={"col-sm-4"}>
              <Form.Control
                size={'sm'}
                name={'CampaignSubmitButton'}
                isValid={formData.isTouched('CampaignSubmitButton') && formData.edits.CampaignSubmitButton?.length > 0}
                isInvalid={formData.isTouched('CampaignSubmitButton') && !(formData.edits.CampaignSubmitButton?.length > 0)}
                value={formData.edits?.CampaignSubmitButton || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignSubmitButton', value: e.target.value})}
                placeholder={'Subscribe'}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignConfirmation'}
            >
              Confirmation
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'CampaignConfirmation'}
                isValid={formData.isTouched('CampaignConfirmation') && formData.edits.CampaignConfirmation?.length > 0}
                isInvalid={formData.isTouched('CampaignConfirmation') && !(formData.edits.CampaignConfirmation?.length > 0)}
                value={formData.edits?.CampaignConfirmation || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignConfirmation', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={labelCols}
              htmlFor={'CampaignResubmitButton'}
            >
              Resubmit Button
            </Form.Label>
            <Col className={"col-sm-4"}>
              <Form.Control
                size={'sm'}
                name={'CampaignResubmitButton'}
                isValid={formData.isTouched('CampaignResubmitButton') && formData.edits.CampaignResubmitButton?.length > 0}
                isInvalid={formData.isTouched('CampaignResubmitButton') && !(formData.edits.CampaignResubmitButton?.length > 0)}
                value={formData.edits?.CampaignResubmitButton || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignResubmitButton', value: e.target.value})}
                placeholder={'Subscribe Another Number'}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>

      <Accordion.Item eventKey={'sms-messages'}>
        <Accordion.Header>
          SMS Messages
        </Accordion.Header>
        <Accordion.Body className={'p-2'}>
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignConfirmationMessage'}
            >
              Confirmation SMS
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'CampaignConfirmationMessage'}
                isValid={formData.isTouched('CampaignConfirmationMessage') && formData.edits.CampaignConfirmationMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignConfirmationMessage') && !(formData.edits.CampaignConfirmationMessage?.length > 0)}
                value={formData.edits?.CampaignConfirmationMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignConfirmationMessage', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignHelpMessage'}
            >
              Help SMS
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'CampaignHelpMessage'}
                isValid={formData.isTouched('CampaignHelpMessage') && formData.edits.CampaignHelpMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignHelpMessage') && !(formData.edits.CampaignHelpMessage?.length > 0)}
                value={formData.edits?.CampaignHelpMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignHelpMessage', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignStopMessage'}
            >
              Stop SMS
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'CampaignStopMessage'}
                isValid={formData.isTouched('CampaignStopMessage') && formData.edits.CampaignStopMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignStopMessage') && !(formData.edits.CampaignStopMessage?.length > 0)}
                value={formData.edits?.CampaignStopMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignStopMessage', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignStopMessage'}
            >
              Default SMS
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={7}
                size={'sm'}
                name={'CampaignDefaultMessage'}
                isValid={formData.isTouched('CampaignDefaultMessage') && formData.edits.CampaignDefaultMessage?.length > 0}
                isInvalid={formData.isTouched('CampaignDefaultMessage') && !(formData.edits.CampaignDefaultMessage?.length > 0)}
                value={formData.edits?.CampaignDefaultMessage || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignDefaultMessage', value: e.target.value})}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey={'email-messages'}>
        <Accordion.Header>
          Email Messages
        </Accordion.Header>
        <Accordion.Body className={'p-2'}>
          <Row className={'mt-1'}>
            <Form.Label
              column={'sm'}
              sm={12}
              htmlFor={'CampaignConfirmationEmail'}
            >
              Confirmation Email
            </Form.Label>
            <Col>
              <Form.Control
                as='textarea'
                rows={10}
                size={'sm'}
                name={'CampaignConfirmationEmail'}
                isValid={formData.isTouched('CampaignConfirmationEmail') && formData.edits.CampaignConfirmationEmail?.length > 0}
                isInvalid={formData.isTouched('CampaignConfirmationEmail') && !(formData.edits.CampaignConfirmationEmail?.length > 0)}
                value={formData.edits?.CampaignConfirmationEmail || ''}
                onChange={(e) => formData.onDataChanged({name: 'CampaignConfirmationEmail', value: e.target.value})}
              />
            </Col>
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
    <CrudButtons
      data={formData.edits}
      type="Campaign"
      keyName={'SMSCampaignID'}
      onUpdate={handleUpdate}
      onCancel={onCancel && handleCancel}
      onDelete={onDelete && confirmDelete}
      isDataValid={isDataValid}
    />
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
      size={'sm'}
    >
      <Modal.Body>
        <h5>Delete Campaign</h5>
        <div>Are you sure you want to delete {campaign?.CampaignName}? This action can't be undone.</div>
        <div className='mt-2 d-flex justify-content-end gap-2'>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>
  </>;
}