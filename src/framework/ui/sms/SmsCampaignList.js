import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, CloseButton, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import SmsCampaignModal from "./SmsCampaignModal";
import '../css/EditableRow.css';
import SmsCampaignPanel from "./SmsCampaignPanel";
import './SmsCampaignList.css';

export default function SmsCampaignList() {

  // imports
  const {SMS} = useRestApi();
  const {hasPermission} = useAuth();

  // states
  const [listItems, setListItems] = useState(/** @type {[SMSCampaignData]} */ null);
  const [sortKey, setSortKey] = useState('SMSCampaignID');
  const [sortAscending, setSortAscending] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [editCampaign, setEditCampaign] = useState(/** @type {SMSCampaignData} */null);
  const [viewCampaign, setViewCampaign] = useState(/** @type {SMSCampaignData} */null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.SITE, Permission.ADMIN));
  }, [setCanEdit, hasPermission]);

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

  useEffect(() => {
    if (!listItems && canEdit) {
      SMS.getSmsCampaigns().then(result => {
        result.sort(sortFunction);
        setListItems(result);
      }).catch(e => {
        console.error(`Error getting campaigns.`, e);
      })
    }
  }, [SMS, listItems, setListItems, sortFunction, canEdit]);

  useEffect(() => {
    if (listItems) {
      for (const campaign of listItems) {
        if (campaign.SubscriberCount === undefined) {
          SMS.getSmsCampaignSubscribers(campaign.SMSCampaignID).then(result => {
            campaign.SubscriberCount = result.length;
            setListItems(value => [...listItems]);
          })
        }
        if (campaign.MessageCount === undefined) {
          SMS.getSmsMessages(campaign.SMSCampaignID).then(result => {
            campaign.MessageCount = result.length;
            setListItems(value => [...listItems]);
          })
        }
      }
    }
  }, [listItems, setListItems, SMS]);

  useEffect(() => {
    if (listItems) {
      setListItems(prevValue => [...prevValue.sort(sortFunction)]);
    }
  }, [setListItems, sortKey, sortAscending, sortFunction]);

  function onSortBy(key) {
    if (sortKey !== key) {
      console.debug(`Sort by ${key}`);
      setSortKey(key);
      setSortAscending(true);
    } else {
      console.debug(`Sort ascending ${!sortAscending}`);
      setSortAscending(!sortAscending);
    }
  }

  function handleAdd(campaign) {
    setEditCampaign(null);
    setListItems([...listItems, campaign]);
  }

  function handleUpdate(updatedCampaign) {
    // update campaign list
    setEditCampaign(null);
    let updated = false;
    listItems.forEach((campaign, index) => {
      if (campaign.SMSCampaignID === updatedCampaign.SMSCampaignID) {
        // update data
        listItems[index] = {...updatedCampaign};
        updated = true;
      }
    });
    if (!updated) {
      // campaign added, not updated
      listItems.push(updatedCampaign);
    }
    listItems.sort(sortFunction);
    setListItems([...listItems]);

  }

  function handleDelete(deleteCampaign) {
    setEditCampaign(null);
    setListItems(listItems.filter(campaign => campaign.SMSCampaignID !== deleteCampaign.SMSCampaignID));
  }

  return <>
    {canEdit && listItems && <>
      {viewCampaign !== null ? <div className="CampaignList position-relative mt-2">
          <CloseButton
            className={'position-absolute'}
            style={{top: '0px', right: '0px'}}
            onClick={() => setViewCampaign(null)}
          />
          <h4>{viewCampaign.CampaignName}</h4>
          <SmsCampaignPanel campaignId={viewCampaign.SMSCampaignID}/>
        </div>
        :
        <>
          <Table
            hover
            responsive
            style={{
              height: 'auto',
              flexGrow: 1,
              overflowY: 'auto'
            }}
          >
            <thead style={{position: 'sticky', top: 0,}}>
            <tr>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('SMSCampaignID')}
                role={'button'}
              >
                ID
                {sortKey === 'SMSCampaignID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('CampaignName')}
                role={'button'}
              >
                Campaign Name
                {sortKey === 'CampaignName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('CampaignName')}
                role={'button'}
              >
                Subscribers
                {sortKey === 'SubscriberCount' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('MessageCount')}
                role={'button'}
              >
                Messages
                {sortKey === 'MessageCount' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
            </tr>
            </thead>
            <tbody>
            {listItems?.map((campaign) => (
              <tr
                role={"button"}
                key={campaign.SMSCampaignID}
                onClick={() => setViewCampaign(campaign)}
                className={'EditableRow'}
              >
                <td>
                  {campaign.SMSCampaignID}
                </td>
                <td className={'d-flex align-items-center position-relative'}>
                  <OverlayTrigger
                    delay={{show: 1000, hide: 500}}
                    overlay={<Tooltip>Edit campaign</Tooltip>}
                  >
                    <BsPencil
                      className={'EditPencil me-2 position-absolute'}
                      style={{left: '-20px'}}
                      onClick={(e) => {
                        setEditCampaign(campaign);
                        e.stopPropagation();
                      }}
                    />
                  </OverlayTrigger>
                  {campaign.CampaignName}
                </td>
                <td>
                  {campaign.SubscriberCount}
                </td>
                <td>
                  {campaign.MessageCount}
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
          <Row className="mt-2">
            <Col>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setEditCampaign({})}
              >
                Add Campaign
              </Button>
            </Col>
          </Row>
          <FormEditor>
            <SmsCampaignModal
              campaign={editCampaign}
              show={editCampaign !== null}
              onHide={() => setEditCampaign(null)}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </FormEditor>
        </>}
    </>}
  </>;
}