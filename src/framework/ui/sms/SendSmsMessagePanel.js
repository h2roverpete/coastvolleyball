import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useEffect, useMemo, useRef, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import './TextMessagePreview.css';
import SmsMessagePreview from "./SmsMessagePreview";
import SmsSubscriberList from "./SmsSubscriberList";
import {useFormData} from "../editor/FormEditor";
import './SendSmsMessagePanel.css';
import {Permission, Resource} from "../../auth/Permissions";
import FileDropTarget, {DropState} from "../editor/FileDropTarget";

/**
 * Display the fields for sending an SMS message.
 *
 * @param campaign {SMSCampaignData}
 * @returns {JSX.Element}
 * @constructor
 */
export default function SendSmsMessagePanel({campaign}) {

  const {currentUser} = useAuth();
  const {SMS, Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();
  const formData = useFormData();

  const hasSendPermission = useMemo(() => hasPermission(Resource.SMS, Permission.SEND), [hasPermission]);
  const hasAdminPermission = useMemo(() => hasPermission(Resource.SMS, Permission.ADMIN), [hasPermission]);

  const [messageSending, setMessageSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [messageLog, setMessageLog] = useState(/** @type [SMSLogData]*/[]);
  const [failureCount, setFailureCount] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);
  const [sendTo, setSendTo] = useState(/** @type SMSSubscriberData[] */ []);
  const [siteData, setSiteData] = useState(/** @type SiteData */null);
  const [mmsFiles, setMmsFiles] = useState(/** @type MMSFileData[] */[]);
  const [changingImage, setChangingImage] = useState(false);

  useEffect(() => {
    if (!siteData && campaign) {
      Sites.getSite(campaign.SiteID).then(site => setSiteData(site)).catch(err => showErrorAlert(err));
    }
  }, [siteData, setSiteData, Sites, campaign, showErrorAlert]);

  useEffect(() => {
    if (formData && !formData.edits.SMSCampaignID) {
      formData.edits.SMSCampaignID = campaign.SMSCampaignID;
    }
    if (formData && !formData.edits.UserID && currentUser?.UserID) {
      formData.edits.UserID = currentUser?.UserID;
    }
  }, [formData, currentUser, campaign.SMSCampaignID]);

  function isDataValid() {
    return formData?.edits.Title?.length > 0 && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/);
  }

  function sendMessage() {
    setMessageSending(true);
    if (sendToAll) {
      SMS.sendSmsMessage(formData.edits).then((result) => {
        setMessageSent(true);
        setMessageSending(false);
        setMessageLog(JSON.parse(result.Log));
      }).catch((err) => {
        showErrorAlert(err);
        setMessageSending(false);
      });
    } else {
      SMS.sendSmsMessage({...formData.edits, Subscribers: sendTo}).then((result) => {
        setMessageSent(true);
        setMessageSending(false);
        setMessageLog(JSON.parse(result.Log));
      }).catch((err) => {
        showErrorAlert(err);
        setMessageSending(false);
      });
    }
  }

  useEffect(() => {
    if (messageLog) {
      let successCount = 0;
      let failureCount = 0;
      for (const logEntry of messageLog) {
        if (logEntry.Error) {
          failureCount++;
        } else {
          successCount++;
        }
      }
      setSuccessCount(successCount);
      setFailureCount(failureCount);
    } else {
      setSuccessCount(0);
      setFailureCount(0);
    }
  }, [messageLog]);

  function handleSubscriberChecked(subscriber, checked) {
    if (checked && !sendTo.includes(subscriber)) {
      setSendTo([...sendTo, subscriber]);
    } else if (!checked && sendTo.includes(subscriber)) {
      setSendTo(sendTo.filter((id) => id !== subscriber));
    }
  }

  function handleAllSubscribersChecked(subscribers) {
    setSendTo(subscribers.map((subscriber) => subscriber.SubscriberID));
  }

  function handleDropFile(e) {
    if (mmsFiles.length === 0) {
      dropRef.current.onDragEnter(e, DropState.ADD)
    } else {
      dropRef.current.onDragEnter(e, DropState.REPLACE)
    }
  }

  function handleFileSelected(file) {
    dropRef.current.setDropState(DropState.HIDDEN);
    setChangingImage(true);
    // save message first to get a message ID
    SMS.insertOrUpdateSmsMessage(formData.edits).then((result) => {
      let files = mmsFiles; // save here because of multiple edits to contents
      formData.update(result);
      if (files.length > 0) {
        // replace existing file
        SMS.deleteMmsFile(campaign.SMSCampaignID, formData.edits.SMSMessageID, mmsFiles[0].MMSFileID).then((result) => {
          files = files.filter((file) => file.MMSFileID !== result.MMSFileID);
          SMS.uploadMmsFile(campaign.SiteID, campaign.SMSCampaignID, result.SMSMessageID, file).then((result) => {
            files = [...files, result];
            setMmsFiles(files);
            setChangingImage(false);
          }).catch((err) => {
            setChangingImage(false);
            showErrorAlert(err);
          });
        }).catch((err) => {
          setChangingImage(false);
          showErrorAlert(err);
        });
      } else {
        SMS.uploadMmsFile(campaign.SiteID, campaign.SMSCampaignID, result.SMSMessageID, file).then((result) => {
          files = [...files, result];
          setMmsFiles(files);
          setChangingImage(false);
        }).catch((err) => {
          setChangingImage(false);
          showErrorAlert(err);
        });
      }
    }).catch((err) => {
      setChangingImage(false);
      showErrorAlert(err);
    });
  }

  function handleDeleteFile(file) {
    setChangingImage(true);
    SMS.deleteMmsFile(campaign.SMSCampaignID, formData.edits.SMSMessageID, file.MMSFileID).then((result) => {
      setMmsFiles(mmsFiles.filter((file) => file.MMSFileID !== result.MMSFileID));
      setChangingImage(false);
    }).catch((err) => {
      setChangingImage(false);
      showErrorAlert(err)
    });
  }

  const dropRef = useRef(/** @type DropFunctions */ null);

  return <>
    {campaign && hasSendPermission && <div className={'SendSmsMessagePanel'}>
      {messageSent ? <>
        <Row className={'mt-2'}><Col><p>Your message was sent to {successCount} subscriber(s). {failureCount} error(s)
          occurred.</p></Col></Row>
        {showLog && <Row className={'mt-2'}>
          <Col>
            {messageLog.map((logEntry) => {
              return <div key={logEntry.SMSLogID}
                          className={logEntry.Error ? "text-danger" : "text-success"}>{logEntry.Subscriber} {logEntry.Error}</div>
            })}
          </Col>
        </Row>}
        <Row className={'mt-2'}><Col>
          <Button variant={"secondary"} style={{marginRight: "10px"}} onClick={() => setShowLog(!showLog)}>{showLog ?
            <span>Hide Details</span> : <span>Show Details</span>}</Button>
          <Button onClick={() => setMessageSent(false)}>Send Another
            Message</Button>
        </Col></Row>
      </> : <>
        <div onDragEnter={(e) => handleDropFile(e)} className="position-relative">
          <Row className={'mt-2'}>
            <Col>
              <Form.Label
                column={'sm'}
                className={'required'}
                htmlFor={'Title'}
              >
                Title for Email Version
              </Form.Label>
              <Form.Control
                name="Title"
                id="Title"
                size="sm"
                type="text"
                value={formData?.edits.Title || ''}
                isValid={formData?.isTouched('Title') && formData.edits.Title?.length > 0}
                isInvalid={formData?.isTouched('Title') && !(formData.edits.Title?.length > 0)}
                onChange={(e) => formData.onDataChanged({name: 'Title', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row className={'mt-2'}>
            <Col>
              <Form.Label
                column={'sm'}
                className={'required'}
                htmlFor={'Message'}
              >
                Message Text
              </Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                size={'sm'}
                name={'Message'}
                value={formData?.edits.Message || ''}
                isValid={formData?.isTouched('Message') && formData.edits.Message?.length > 0 && formData.edits.Message?.match(/[.?!]$/)}
                isInvalid={formData?.isTouched('Message') && (!(formData.edits.Message?.length > 0) || !formData.edits.Message?.match(/[.?!]$/))}
                onChange={(e) => formData.onDataChanged({name: 'Message', value: e.target.value})}
              />
            </Col>
          </Row>
          <Row><Col className={"small text-secondary"}>End your message with punctuation (.?!) to ensure
            readability.</Col></Row>
          <Row className={'mt-2'}><Col>
            <Button
              style={{width: '150px'}}
              variant={"secondary"}
              onClick={() => mmsFiles?.length > 0 ? handleDeleteFile(mmsFiles[0]) : dropRef.current.selectFile()}
            >
              {changingImage ? <Spinner size="sm"/> : <>{mmsFiles?.length > 0 ? <>Remove</> : <>Add an</>} Image</>}
            </Button>
          </Col></Row>
          <SmsMessagePreview
            campaign={campaign}
            message={formData?.edits}
            files={mmsFiles}
            onDeleteFile={handleDeleteFile}
          />
          <FileDropTarget
            ref={dropRef}
            onFileSelected={handleFileSelected}
            onError={(err) => {
              showErrorAlert(err);
              dropRef.current.setDropState(DropState.HIDDEN);
            }}
            mimeTypes={[
              'image/jpeg',
              'image/png',
              'image/gif']}
          />
        </div>
        {hasAdminPermission && <>
          <Row className={'mt-2'}>
            <Col className={'d-flex'}>
              <Form.Label
                xxl={2}
                column={'sm'}
                htmlFor={'SendToAll'}
                className={'me-4'}
              >
                Send to:
              </Form.Label>
              <Form.Check
                type='radio'
                name={'SendToAll'}
                checked={sendToAll}
                onChange={() => setSendToAll(!sendToAll)}
                label={"All subscribers"}
                inline
              />
              <Form.Check
                type='radio'
                name={'SendToAll'}
                checked={!sendToAll}
                onChange={() => setSendToAll(!sendToAll)}
                label={"Selected subscribers"}
                inline
              />
            </Col>
          </Row>
          <div hidden={sendToAll} className={'SmsSubscriberList'}>
            <SmsSubscriberList
              campaign={campaign}
              onItemChecked={handleSubscriberChecked}
              onAllItemsChecked={handleAllSubscribersChecked}
              showFilter={true}
            />
          </div>
        </>}
        <Row className={'mt-3'}>
          <Col>
            <Button
              disabled={!isDataValid() || messageSending}
              onClick={sendMessage}
              style={{width: '200px'}}
            >
              {messageSending ? <Spinner animation="border" size="sm"/> :
                <span>{sendToAll ? <>Send Message</> : <>Send
                  to {sendTo.length} Subscriber{sendTo.length !== 1 && <>s</>}</>}</span>}
            </Button>
          </Col>
        </Row>
      </>}
    </div>}
  </>
}