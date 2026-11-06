import {useCallback, useEffect, useRef, useState} from "react";
import {Table, Form, Button} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsLogEntryModal from "./SmsLogEntryModal";
import {isValidPhoneNumber} from "../../util/Validators";
import {formatPhoneNumber} from "../../util/Formatters";
import './SmsLogEntryList.css';

/**
 * @typedef ListAPI<T>
 *
 * @property {function([T])} addListItems
 * @property {function(): [T]} getListItems
 * @property {function(): [T]} getCheckedItems
 * @property {function()} clearCheckedItems
 * @property {function()} refresh
 */

/**
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData | null} [message]
 * @param {function(SMSLogData, Boolean)} [onItemChecked]         Callback when a list item is checked or unchecked
 * @param {function([SMSLogData], Boolean)} [onAllItemsChecked]                 Callback for check all / uncheck all items.
 * @param {RefObject<function(ListAPI<SMSLogData>)>} [apiRef]      API for accessing list.
 * @constructor
 */
export default function SmsLogEntryList({campaign, message, onItemChecked, onAllItemsChecked, apiRef}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [listItems, setListItems] = useState(/** @type {[SMSLogData]} */ null);
  const [editItem, setEditItem] = useState( /** @type {SMSLogData} */ null);
  const [checkedItems, setCheckedItems] = useState( /** @type {[SMSLogData]} */ []);

  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);
  const [pageKeys, setPageKeys] = useState([]);

  const tableRef = useRef(null);

  const sortFunction = useCallback((a, b) => {
    if (a[sortKey] !== undefined && b[sortKey] !== undefined) {
      switch (typeof a[sortKey]) {
        case 'number':
          return sortAscending ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey];
        case 'string':
          return sortAscending ? a[sortKey].localeCompare(b[sortKey]) : b[sortKey].localeCompare(a[sortKey]);
        default:
          return 0;
      }
    } else if (a[sortKey] === undefined && b[sortKey] !== undefined) {
      return sortAscending ? 1 : -1;
    } else if (a[sortKey] !== undefined && b[sortKey] === undefined) {
      return sortAscending ? -1 : 1;
    } else {
      return 0
    }
  }, [sortKey, sortAscending]);

  const itemsPerPage = 100;

  useEffect(() => {
    if (campaign && message && !listItems) {
      SMS.getSmsMessageLog(campaign.SMSCampaignID, message.SMSMessageID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    } else if (campaign && !listItems) {
      SMS.getSmsLogData(campaign.SMSCampaignID, undefined, itemsPerPage).then((result) => {
        setPageKeys([result.LastEvaluatedKey]);
        setListItems(result.Items.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [SMS, campaign, showErrorAlert, message, listItems, setListItems, sortFunction, setPageKeys]);

  function nextPage() {
    if (pageKeys.length > 0 && pageKeys.at(-1)) {
      SMS.getSmsLogData(campaign.SMSCampaignID, pageKeys.at(-1), itemsPerPage).then((result) => {
        pageKeys.push(result.LastEvaluatedKey);
        setPageKeys([...pageKeys]);
        setListItems(result.Items.sort(sortFunction));
        tableRef.current.parentElement.scrollTop = 0;
        tableRef.current.parentElement.scrollLeft = 0;
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }

  function prevPage() {
    SMS.getSmsLogData(campaign.SMSCampaignID, pageKeys.length > 2 ? pageKeys.at(-3) : undefined, itemsPerPage).then((result) => {
      pageKeys.pop();
      setPageKeys([...pageKeys]);
      setListItems(result.Items.sort(sortFunction));
      tableRef.current.parentElement.scrollTop = 0;
      tableRef.current.parentElement.scrollLeft = 0;
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  /**
   * @type {(function([SMSLogData]): void)|*}
   */
  const handleAddItems = useCallback((items) => {
    setListItems([...listItems, ...items].sort(sortFunction));
  }, [listItems, sortFunction, setListItems]);

  if (apiRef) {
    apiRef.current = {
      addListItems: handleAddItems,
      getListItems: () => listItems,
      getCheckedItems: () => checkedItems,
      clearCheckedItems: () => setCheckedItems([]),
      refresh: () => setListItems(null),
    }
  }

  function arraysAreEqual(a, b) {
    return a && b && a.length === b.length && a.every((v, i) => v === b[i]);
  }

  useEffect(() => {
    if (listItems) {
      const sorted = listItems.toSorted(sortFunction);
      if (!arraysAreEqual(listItems, sorted)) {
        setListItems(sorted);
      }
    }
  }, [setListItems, listItems, sortKey, sortAscending, sortFunction]);


  function sortBy(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(true);
    } else {
      setSortAscending(!sortAscending);
    }
  }

  function handleItemChecked(item, checked) {
    if (checked && !checkedItems.includes(checked)) {
      setCheckedItems([...checkedItems, item]);
    } else if (!checked && checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((v) => v !== item));
    }
    onItemChecked?.(item, checked);
  }

  function handleAllItemsChecked(checked) {
    if (checked) {
      setCheckedItems(listItems);
      onAllItemsChecked?.(listItems, checked);
    } else {
      setCheckedItems([]);
      onAllItemsChecked?.([], checked);
    }

  }

  return <>{listItems?.length > 0 && <div className={'SmsLogEntryList'}>
    <Table
      hover
      responsive
      className={'SmsLogEntryList'}
      ref={tableRef}
    >
      <thead style={{position: 'sticky', top: 0,}}>
      <tr>
        {onItemChecked && <th onClick={(e) => {
          e.stopPropagation()
        }}>
          {onAllItemsChecked && <Form.Check
            role={'button'}
            onChange={(e) => handleAllItemsChecked(e.target.checked)}
          />}
        </th>}
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('SMSLogID')}
        >
          ID
          {sortKey === 'SMSLogID' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Created')}
        >
          Timestamp
          {sortKey === 'Created' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Action')}
        >
          Action
          {sortKey === 'Action' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Subscriber')}
        >
          Subscriber
          {sortKey === 'Subscriber' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
        <th
          className={'text-nowrap'}
          role={'button'}
          onClick={() => sortBy('Error')}
        >
          Result
          {sortKey === 'Error' &&
            <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
          }
        </th>
      </tr>
      </thead>
      <tbody>
      {listItems.map((listItem) =>
        <tr
          key={listItem.SMSLogID}
          onClick={() => setEditItem(listItem)}
          role={'button'}
        >
          {onItemChecked && <td onClick={(e) => {
            e.stopPropagation()
          }}>
            <Form.Check
              role={'button'}
              checked={checkedItems.includes(listItem)}
              onChange={(e) => {
                handleItemChecked(listItem, e.target.checked);
              }}
            />
          </td>}
          <td>{listItem.SMSLogID}</td>
          <td className={'text-nowrap'}>{Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          }).format(Date.parse(listItem.Created))}</td>
          <td>{listItem.Action}</td>
          <td>
            {isValidPhoneNumber(listItem.Subscriber) ?
              formatPhoneNumber(listItem.Subscriber) :
              listItem.Subscriber ?
                listItem.Subscriber :
                <>{listItem.IncomingMessage && formatPhoneNumber(JSON.parse(listItem.IncomingMessage).originationNumber)}</>
            }
          </td>
          <td
            className={listItem.Error ? 'text-danger' : 'text-success'}>{listItem.Error ? listItem.Error : 'OK'}
          </td>
        </tr>
      )}
      </tbody>
    </Table>
    {(pageKeys.length > 1 || (pageKeys.length === 1 && pageKeys.at(0))) &&
      <div className={'d-flex mt-3'}>
        {pageKeys.length > 1 &&
          <div className={'d-flex'}><Button size={'sm'} onClick={prevPage}>&laquo; Previous Page</Button></div>}
        {pageKeys.at(-1) &&
          <div className={'d-flex flex-fill justify-content-end'}><Button size={'sm'} onClick={nextPage}>Next
            Page &raquo;</Button></div>}
      </div>
    }
    <SmsLogEntryModal show={editItem} campaign={campaign} logEntry={editItem} onHide={() => setEditItem(null)}/>
  </div>}
  </>
}