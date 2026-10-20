import {useCallback, useEffect, useState} from "react";
import {Table, Form, Button, Row, Col} from "react-bootstrap";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import SmsSubscriberModal from "./SmsSubscriberModal";
import FormEditor from "../editor/FormEditor";
import './SmsSubscriberList.css';

/**
 * @typedef ListAPI<T>
 *
 * @property {function([T])} addListItems
 * @property {function(): [T]} getListItems
 * @property {function(): [T]} getCheckedItems
 */

/**
 * Display a list of campaign subscribers.
 *
 * @param {SMSCampaignData} campaign
 * @param {function(SMSSubscriberData, Boolean)} [onItemChecked]          Callback when a list item is checked or unchecked
 * @param {function([SMSSubscriberData], Boolean)} [onAllItemsChecked]    Callback for check all / uncheck all items.
 * @param {RefObject<function(ListAPI<SMSSubscriberData>)>} [apiRef]      API for accessing list.
 * @param {Boolean} [canAddSubscribers]                                   Show a button for adding subscribers.
 * @param {Boolean} [canEditSubscribers]                                  Allow clicks in list to edit subscribers.
 * @param {Boolean} [showFilter]                                          Show the filter panel.
 * @constructor
 */
export default function SmsSubscriberList(
  {
    campaign,
    onItemChecked,
    onAllItemsChecked,
    apiRef,
    canAddSubscribers,
    canEditSubscribers,
    showFilter,
  }) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [listItems, setListItems] = useState(/** @type {[SMSSubscriberData]} */ null);
  const [editItem, setEditItem] = useState( /** @type {SMSSubscriberData} */ null);
  const [checkedItems, setCheckedItems] = useState( /** @type {[SMSSubscriberData]} */ []);
  const [sortKey, setSortKey] = useState('Created');
  const [sortAscending, setSortAscending] = useState(false);
  const [filter, setFilter] = useState(/** @type String */ '');

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

  useEffect(() => {
    if (campaign && !listItems) {
      SMS.getSmsCampaignSubscribers(campaign.SMSCampaignID).then((result) => {
        setListItems(result.sort(sortFunction));
      }).catch((error) => {
        showErrorAlert(error);
      })
    }
  }, [SMS, campaign, showErrorAlert, listItems, setListItems, sortFunction]);

  /**
   * @type {(function([SMSSubscriberData]): void)|*}
   */
  const handleAddItems = useCallback((items) => {
    setListItems([...listItems, ...items].sort(sortFunction));
  }, [listItems, sortFunction, setListItems]);

  if (apiRef) {
    apiRef.current = {
      addListItems: handleAddItems,
      getListItems: () => listItems,
      getCheckedItems: () => checkedItems,
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
    } else {
      setCheckedItems([]);
    }
    onAllItemsChecked?.(checked ? listItems : [], checked);
  }

  const filterFunction = useCallback((item) => {
    if (filter?.length > 0) {
      return item.SubscriberName?.toLowerCase().includes(filter.toLowerCase())
        || item.SubscriberEmail?.toLowerCase().includes(filter.toLowerCase())
        || item.SubscriberMobileNumber?.toLowerCase().includes(filter.toLowerCase());
    } else {
      return true;
    }
  }, [filter]);

  function handleDelete(data) {
    setListItems(listItems.filter((item) => item.SubscriberID !== data.SubscriberID));
  }

  function handleAdd(data) {
    setListItems([...listItems, data]);
  }

  function handleUpdate(data) {
    setListItems(listItems.map((item) => item.SubscriberID !== data.SubscriberID ? item : data));
  }

  return <>{listItems?.length > 0 && <>
    {showFilter && <Row className={'mb-3'}>
      <Col className={'d-flex text-nowrap align-items-center mt-3'}>
        <span className={'me-3'}>Filter by:</span>
        <Form.Control
          size={'sm'}
          name={'filter'}
          value={filter || ''}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button
          variant={'secondary'}
          size={'sm'}
          className={'ms-3 me-3'}
          onClick={() => setFilter('')}
          disabled={!filter}
        >Clear
        </Button>
      </Col>
    </Row>}
    <div className={'SmsSubscriberList'}>
      <Table
        hover={canEditSubscribers}
        responsive
        className={"SmsSubscriberList"}
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
            onClick={() => sortBy('SubscriberID')}
          >
            ID
            {sortKey === 'SubscriberID' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('SubscriberName')}
          >
            Name
            {sortKey === 'SubscriberName' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('SubscriberMobileNumber')}
          >
            Mobile
            {sortKey === 'SubscriberMobileNumber' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('SubscriberEmail')}
          >
            Email
            {sortKey === 'SubscriberEmail' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
          <th
            className={'text-nowrap'}
            role={'button'}
            onClick={() => sortBy('Created')}
          >
            Created
            {sortKey === 'Created' &&
              <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>
            }
          </th>
        </tr>
        </thead>
        <tbody>
        {listItems.filter(filterFunction).map((listItem) =>
          <tr
            key={listItem.SubscriberID}
            onClick={() => canEditSubscribers && setEditItem(listItem)}
            role={canEditSubscribers && 'button'}
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
            <td>{listItem.SubscriberID}</td>
            <td className={listItem.Unsubscribed ? 'text-danger' : ''}>{listItem.SubscriberName}</td>
            <td>{listItem.SubscriberMobileNumber}</td>
            <td>{listItem.SubscriberEmail}</td>
            <td>
              {Intl.DateTimeFormat('en-US', {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              }).format(Date.parse(listItem.Created))}
            </td>
          </tr>
        )}
        </tbody>
      </Table>
    </div>
    {canAddSubscribers && <Row className={'mt-3'}><Col>
      <Button
        variant={'primary'}
        onClick={() => setEditItem({SMSCampaignID: campaign.SMSCampaignID})}
      >
        Add Subscriber
      </Button>
    </Col></Row>}
    <FormEditor>
      <SmsSubscriberModal
        show={editItem}
        subscriber={editItem}
        onHide={() => setEditItem(null)}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </FormEditor>
  </>}
  </>
}