import {useEffect, useMemo, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Button, Modal, ModalBody, Spinner} from "react-bootstrap";
import SmsMessagePreview from "./SmsMessagePreview";
import SmsLogEntryList from "./SmsLogEntryList";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

/**
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @param {function(SMSMessageData)} onDelete
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsMessagePanel({campaign, message, onDelete}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();

  const hasSendPermission = useMemo(() => hasPermission(Resource.SMS, Permission.SEND), [hasPermission]);
  const hasAdminPermission = useMemo(() => hasPermission(Resource.SMS, Permission.ADMIN), [hasPermission]);

  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState(/** @type MMSFileData[] */ []);
  const [checkedSubscribers, setCheckedSubscribers] = useState([]);
  const [subscribers, setSubscribers] = useState( /** @type {[SMSSubscriberData]} */ null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const listApi = useRef(/** @type ListAPI */ null);

  useEffect(() => {
    SMS.getMmsFiles(message.SMSCampaignID, message.SMSMessageID).then((result) => {
      setFiles(result);
    }).catch((err) => showErrorAlert(err));
  }, [message, SMS, setFiles, showErrorAlert])

  useEffect(() => {
    if (!subscribers && message) {
      SMS.getSmsCampaignSubscribers(message.SMSCampaignID).then((result) => {
        setSubscribers(result);
      }).catch((err) => showErrorAlert(err));
    }
  }, [message, SMS, subscribers, setSubscribers, showErrorAlert])

  function resendMessage() {
    if (checkedSubscribers.length > 0) {
      setSending(true);
      SMS.sendSmsMessage({
        ...message,
        Subscribers: checkedSubscribers,
      }).then(() => {
        listApi.current?.refresh();
        listApi.current?.clearCheckedItems();
        setCheckedSubscribers([]);
        setSending(false);
      }).catch((error) => {
        showErrorAlert(error);
        setSending(false);
      })
    }
  }

  function handleItemChecked(item, checked) {
    const subscriber = subscribers?.find((sub) => sub.SubscriberID === item.SubscriberID);
    const checkedSubscriber = checkedSubscribers?.find((sub) => sub.SubscriberID === item.SubscriberID);
    if (checked && subscriber && !checkedSubscriber) {
      setCheckedSubscribers([...checkedSubscribers, subscriber]);
    } else if (!checked) {
      setCheckedSubscribers(checkedSubscribers.filter((sub) => sub.SubscriberID !== item.SubscriberID));
    }
  }

  function handleAllItemsChecked(items, checked) {
    if (checked) {
      setCheckedSubscribers(
        items.map((item) => {
          return subscribers.map((sub) => {
            return sub.SubscriberID === item.SubscriberID && sub;
          })
        })
      );
    } else {
      setCheckedSubscribers([]);
    }
  }

  function handleDelete() {
    setShowDeleteConfirmation(false);
    onDelete?.(message);
  }

  return <>{message && hasSendPermission &&
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden'}}>
      <div className={'mb-4'}>
        <SmsMessagePreview message={message} campaign={campaign} files={files}/>
      </div>
      <SmsLogEntryList
        campaign={campaign}
        message={message}
        onItemChecked={handleItemChecked}
        onAllItemsChecked={handleAllItemsChecked}
        apiRef={listApi}
      />
      <div className={"mt-4 d-flex gap-3"}>
        <Button
          variant={'primary'}
          disabled={checkedSubscribers.length === 0 || sending}
          onClick={resendMessage}
          style={{width: '300px'}}
        >
          {sending ?
            <Spinner size={"sm"}/>
            :
            <>Resend to {checkedSubscribers.length} Subscriber{checkedSubscribers.length !== 1 && 's'}</>
          }

        </Button>
        {onDelete && hasAdminPermission &&
          <Button
            variant={'danger'}
            onClick={() => setShowDeleteConfirmation(true)}
          >
            Delete Message
          </Button>
        }
      </div>
      <Modal className={'Editor'} show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)}>
        <ModalBody>
          <h5>Delete Message</h5>
          <p>Are you sure you want to delete this message, all logs and related resources?</p>
          <Button className={"me-3"} variant={'danger'} onClick={handleDelete}>Delete</Button>
          <Button onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        </ModalBody>
      </Modal>
    </div>}</>;
}