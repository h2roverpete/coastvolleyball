import {useAuth} from "framework/auth/AuthProvider";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Resource, Permission} from "framework/auth/Permissions";
import {Table} from "react-bootstrap";
import {useRestApi} from "framework/api/RestApi";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import "../css/EditableRow.css";

/**
 * Display a list of SMS messages for the specified campaign.
 *
 * @param {SMSCampaignData} campaign
 * @param {function(SMSMessageData)} onViewMessage
 * @param {function(SMSMessageData)} onDeleteMessage
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsMessageList({campaign, onViewMessage}) {

  const {SMS} = useRestApi();
  const {hasPermission, currentUser} = useAuth();

  const hasSendPermission = useMemo(() => hasPermission(Resource.SMS, Permission.SEND), [hasPermission]);
  const hasAdminPermission = useMemo(() => hasPermission(Resource.SMS, Permission.ADMIN), [hasPermission]);

  const [messages, setMessages] = useState(null);
  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);

  useEffect(() => {
    if (campaign && !messages) {
      SMS.getSmsMessages(campaign.SMSCampaignID).then((result) => {
        if (!hasAdminPermission) {
          // user with send permission can only see their own messages
          result = result.filter((item) => item.UserID === currentUser.UserID);
        }
        setMessages(result);
      });
    }
  }, [SMS, campaign, messages, setMessages, currentUser.UserID, hasAdminPermission]);

  const sortFunction = useCallback((a, b) => {
    switch (typeof a[sortKey]) {
      case 'number':
        return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      case 'string':
        return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      default:
        return 0;
    }
  }, [sortAscending, sortKey]);

  function arraysAreEqual(a, b) {
    return a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  }

  useEffect(() => {
    if (messages) {
      const sorted = messages.toSorted(sortFunction);
      if (!arraysAreEqual(messages, sorted)) {
        setMessages(sorted);
      }
    }
  }, [setMessages, messages, sortKey, sortAscending, sortFunction]);


  function onSortBy(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  }

  return <>{hasSendPermission && messages &&
    <Table
      hover
      responsive
      style={{
        height: "100%",
        overflowY: 'auto'
      }}
    >
      <thead style={{position: 'sticky', top: 0,}}>
      <tr>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => onSortBy('SMSMessageID')}
        >
          ID
          {sortKey === 'SMSMessageID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => onSortBy('Title')}
        >
          Title
          {sortKey === 'Title' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => onSortBy('Created')}
        >
          Sent
          {sortKey === 'Created' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
      </tr>
      </thead>
      <tbody>
      {messages.map((message) => (
        <tr
          className={'EditableRow'}
          key={message.SMSMessageID}
          onClick={() => onViewMessage(message)}
        >
          <td>{message.SMSMessageID}</td>
          <td>{message.Title}</td>
          <td>{Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }).format(Date.parse(message.Created))}</td>
        </tr>
      ))}
      </tbody>
    </Table>
    }</>
  }