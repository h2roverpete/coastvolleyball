import {useEffect, useState, useCallback} from "react";
import {useRestApi} from "../../api/RestApi";
import {Button, Table} from "react-bootstrap";
import SmsWhitelistEntryModal from "./SmsWhitelistEntryModal";
import {BsSortDown, BsSortUp} from "react-icons/bs";

export default function SmsWhitelist({campaignId}) {

  const {SMS} = useRestApi();

  const [whitelist, setWhitelist] = useState(/** @type{[SMSWhitelistEntry]} */ null);
  const [editItem, setEditItem] = useState(null);
  const [sortKey, setSortKey] = useState('Name');
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    if (!whitelist && campaignId) {
      SMS.getSmsWhitelist(campaignId).then((response) => {
        setWhitelist(response);
      })
    }
  }, [SMS, campaignId, whitelist, setWhitelist]);

  function sortBy(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  }

  const sortFunction = useCallback((a, b) => {
    switch (typeof a[sortKey]) {
      case 'number':
        return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
      case 'string':
        return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
      default:
        return 0;
    }
  }, [sortKey, sortAscending]);

  function arraysAreEqual(a, b) {
    return a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  }

  useEffect(() => {
    if (whitelist) {
      const sorted = whitelist.sort(sortFunction);
      if (!arraysAreEqual(whitelist, sorted)) {
        setWhitelist(sorted);
      }
    }
  }, [setWhitelist, whitelist, sortKey, sortAscending, sortFunction]);

  function onEditItem(data) {
    setEditItem(data);
  }

  function onAddItem() {
    setEditItem({SMSCampaignID: campaignId});
  }

  function handleAdd(data) {
    setEditItem(null);
    setWhitelist([...whitelist, data]);
  }

  function handleUpdate(data) {
    setEditItem(null);
    setWhitelist(whitelist.map((item) => {
      return item.WhitelistEntryID === data.WhitelistEntryID ? data : item;
    }));
  }

  function handleDelete(data) {
    setEditItem(null);
    setWhitelist(whitelist.filter(item => item.WhitelistEntryID !== data.WhitelistEntryID));
  }

  return <>
    <Table
      hover
      responsive
    >
      <thead>
      <tr>
        <th
          role={'button'}
          onClick={() => {
            sortBy('Name')
          }}
        >
          Name
          {sortKey === 'Name' &&
            <span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>}
        </th>
        <th
          role={'button'}
          onClick={() => {
            sortBy('Email')
          }}
        >Email
          {sortKey === 'Email' &&
            <span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>}
        </th>
        <th
          role={'button'}
          onClick={() => {
            sortBy('Phone')
          }}
        >Phone
          {sortKey === 'Phone' &&
            <span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>}
        </th>
      </tr>
      </thead>
      <tbody>
      {whitelist?.map((item) => (
        <tr
          className={'EditableRow position-relative'}
          key={item.WhitelistEntryID}
          onClick={() => onEditItem(item)}
        >
          <td>{item.Name}</td>
          <td>{item.Email}</td>
          <td>{item.Phone}</td>
        </tr>
      ))}
      </tbody>
    </Table>
    <Button size={'sm'} onClick={onAddItem}>Add Whitelist Entry</Button>
    <SmsWhitelistEntryModal
      show={editItem != null}
      entry={editItem}
      onHide={() => setEditItem(null)}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  </>
}