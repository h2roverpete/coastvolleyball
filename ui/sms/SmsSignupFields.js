import {useFormData} from "../editor/FormEditor";
import {lazy, Suspense, useEffect, useState} from "react";
import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi"
import {useSiteContext} from "../content/Site";
import './SmsSignupFields.css';
import {isValidEmail} from "../../util/Validators";

const PhoneNumberField = lazy(()=>import("../forms/PhoneNumberField")) ;
const EmailField  = lazy(()=>import("../forms/EmailField")) ;

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSignupFields({smsCampaignId}) {

  /** @type {[SMSCampaignData,React.Dispatch<React.SetStateAction<SMSCampaignData>>]} */
  const [smsCampaignConfig, setSmsCampaignConfig] = useState();

  const {SMS} = useRestApi();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();

  useEffect(() => {
    if (!smsCampaignConfig) {
      SMS.getSmsCampaign(smsCampaignId).then((response) => {
        setSmsCampaignConfig(response);
      }).catch((error) => showErrorAlert(error));
    }
  })

  useEffect(() => {
    // set up default notification method
    if (smsCampaignConfig && !formData.edits.NotificationMethod) {
      if (smsCampaignConfig?.TextCampaign && smsCampaignConfig.EmailCampaign) {
        formData.onDataChanged({name: 'NotificationMethod', value: 'text'}); // default to text
      } else if (smsCampaignConfig?.EmailCampaign) {
        formData.onDataChanged({name: 'NotificationMethod', value: 'email'}); // email only
      } else {
        formData.onDataChanged({name: 'NotificationMethod', value: 'text'}); // text only
      }
    }
  }, [smsCampaignConfig, formData]);

  function isDataValid() {
    const number = formData.edits.SubscriberMobileNumber?.replaceAll(/[^0-9+]/g, "");
    return formData.edits.SubscriberName?.length > 0
      && (
        (number?.length === 12 && number.startsWith('+1') && formData.edits.AcceptAgreement && formData.edits.AcceptTermsAndConditions && formData.edits.NotificationMethod !== 'email')
        || (isValidEmail(formData.edits.SubscriberEmail) && formData.edits.NotificationMethod === 'email')
      )
      ;
  }

  function handleSubmit() {
    setSubmitting(true);
    const data = {
      SMSCampaignID: parseInt(smsCampaignId),
      SubscriberName: formData.edits.SubscriberName,
    }
    if (formData.edits.NotificationMethod !== 'email') {
      data.SubscriberMobileNumber = formData.edits.SubscriberMobileNumber.replaceAll(/[^0-9+]/g, "")
    } else {
      data.SubscriberEmail = formData.edits.SubscriberEmail;
    }
    SMS.insertOrUpdateSmsSubscriber(data).then((response) => {
      formData.setData(response)
      setSubmitted(true);
      setSubmitting(false);
    }).catch((err) => {
      showErrorAlert(err);
      setSubmitting(false);
    });
  }

  function handleReset() {
    formData.reset();
    setSubmitted(false);
  }

  const labelCols = 3;
  if (!smsCampaignConfig) {
    return <></>
  } else return <div className="container-fluid SmsSignupFields">
    {submitted ?
      <>
        <p className="SectionText">{smsCampaignConfig?.CampaignConfirmation}</p>
        <p><Button
          variant={'primary'}
          onClick={() => handleReset()}
        >
          {smsCampaignConfig?.CampaignResubmitButton ? <>{smsCampaignConfig.CampaignResubmitButton}</> : <>Submit
            Again</>}
        </Button>
        </p>
      </>
      :
      <Suspense>
        <Row className={'mt-2'}>
          <Col>
            <div className="SectionText" dangerouslySetInnerHTML={{__html: smsCampaignConfig?.CampaignDescription}}/>
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Form.Label
            column={true}
            sm={labelCols}
            className={'required'}
            htmlFor={'SubscriberName'}
          >
            Name
          </Form.Label>
          <Col sm={7}>
            <Form.Control
              id={'SubscriberName'}
              isValid={formData.isTouched('SubscriberName') && formData.edits.SubscriberName?.length > 0}
              isInvalid={formData.isTouched('SubscriberName') && !(formData.edits.SubscriberName?.length > 0)}
              value={formData.edits?.SubscriberName || ''}
              onChange={(e) => formData.onDataChanged({name: 'SubscriberName', value: e.target.value})}
            />
          </Col>
        </Row>
        {smsCampaignConfig?.EmailCampaign && smsCampaignConfig?.TextCampaign &&
          <Row className={'mt-2'}>
            <Form.Label
              column={true}
              sm={labelCols}
              className={'required'}
              htmlFor={'NotificationMethod'}
            >
              Notify Me By
            </Form.Label>
            <Col className={'d-flex align-items-center'}>
              <Form.Check
                type={'radio'}
                role={'button'}
                label={'Text Message'}
                value={'text'}
                id={'NotificationMethod'}
                onChange={(e) => {
                  formData.onDataChanged({name: 'NotificationMethod', value: e.target.value})
                }}
                checked={formData.edits.NotificationMethod === 'text'}
                inline
              />
              <Form.Check
                type={'radio'}
                role={'button'}
                label={'Email'}
                value={'email'}
                id={'NotificationMethod'}
                onChange={(e) => {
                  formData.onDataChanged({name: 'NotificationMethod', value: e.target.value})
                }}
                checked={formData.edits.NotificationMethod === 'email'}
                inline
              />
            </Col>
          </Row>
        }
        {smsCampaignConfig?.TextCampaign && formData.edits.NotificationMethod === 'text' &&
          <>
            <Row className={'mt-2'}>
              <Form.Label
                column={true}
                sm={labelCols}
                htmlFor={'SubscriberMobileNumber'}
                className={'required'}
              >
                Mobile Number
              </Form.Label>
              <Col sm={7}>
                <PhoneNumberField
                  name={'SubscriberMobileNumber'}
                  id={'SubscriberMobileNumber'}
                  value={formData.edits?.SubscriberMobileNumber || ''}
                  onChange={(data) => formData.onDataChanged(data)}
                />
              </Col>
            </Row>
            <Row className={'mt-4'}>
              <Col xs={1} className={'text-center'}>
                <Form.Check
                  type={'checkbox'}
                  role={'button'}
                  name={`AcceptAgreement`}
                  checked={formData.edits?.AcceptAgreement || 0}
                  onChange={(e) => formData.onDataChanged({name: 'AcceptAgreement', value: e.target.checked})}
                />
              </Col>
              <Col>
                <div className="SectionText" dangerouslySetInnerHTML={{__html: smsCampaignConfig?.CampaignAgreement}}/>
              </Col>
            </Row>
            {smsCampaignConfig?.CampaignTermsAndConditions &&
              <Row className={'mt-4'}>
                <Col xs={1} className={'text-center'}>
                  <Form.Check
                    type={'checkbox'}
                    role={'button'}
                    name={`AcceptTermsAndConditions`}
                    checked={formData.edits?.AcceptTermsAndConditions || 0}
                    onChange={(e) => formData.onDataChanged({name: 'AcceptTermsAndConditions', value: e.target.checked})}
                  />
                </Col>
                <Col>
                  <div className="SectionText" dangerouslySetInnerHTML={{__html: smsCampaignConfig?.CampaignTermsAndConditions}}/>
                </Col>
              </Row>
            }
          </>
        }
        {smsCampaignConfig?.EmailCampaign && formData.edits.NotificationMethod === 'email' &&
          <Row className={'mt-2'}>
            <Form.Label
              column={true}
              sm={labelCols}
              htmlFor={'SubscriberEmail'}
              className={'required'}
            >
              Email Address
            </Form.Label>
            <Col sm={7}>
              <EmailField
                id={'SubscriberEmail'}
                name={'SubscriberEmail'}
                value={formData.edits?.SubscriberEmail || ''}
                onChange={(e) => formData.onDataChanged({name: 'SubscriberEmail', value: e.target.value})}
              />
            </Col>
          </Row>
        }
        <Row className="form-group mt-4">
          <Col>
            <Button
              variant={'primary'}
              disabled={!isDataValid()}
              onClick={(e) => handleSubmit(e)}
              style={{width: '100px'}}
            >
              {submitting ?
                <Spinner size={'sm'}/>
                :
                <>{smsCampaignConfig?.CampaignSubmitButton ? <>{smsCampaignConfig.CampaignSubmitButton}</> : <>Submit</>}</>
              }
            </Button>
          </Col>
        </Row>
      </Suspense>}
  </div>;
}