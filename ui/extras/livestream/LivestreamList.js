import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, CloseButton, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import '../../css/EditableRow.css';
import './LivestreamList.css';
import {useSiteContext} from "../../content/Site";
import LivestreamPanel from "./LivestreamPanel";
import LivestreamModal from "./LivestreamModal";

export default function SmsCampaignList() {

  // imports
  const {Livestreams} = useRestApi();
  const {hasPermission} = useAuth();
  const {showErrorAlert} = useSiteContext();

  // states
  const [listItems, setListItems] = useState(/** @type {[LivestreamData]} */ null);
  const [sortKey, setSortKey] = useState('LivestreamName');
  const [sortAscending, setSortAscending] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [edit, setEdit] = useState(/** @type {LivestreamData} */null);
  const [view, setView] = useState(/** @type {LivestreamData} */null);

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
      Livestreams.getLivestreams().then(result => {
        result.sort(sortFunction);
        setListItems(result);
      }).catch(e => {
        showErrorAlert(`Error getting livestreams.`, e);
      })
    }
  }, [Livestreams, listItems, setListItems, sortFunction, canEdit, showErrorAlert]);

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
    setEdit(null);
    setListItems([...listItems, campaign]);
  }

  function handleUpdate(newData) {
    // update campaign list
    setEdit(null);
    let updated = false;
    listItems.forEach((campaign, index) => {
      if (campaign.LivestreamID === newData.LivestreamID) {
        // update data
        listItems[index] = {...newData};
        updated = true;
      }
    });
    if (!updated) {
      // campaign added, not updated
      listItems.push(newData);
    }
    listItems.sort(sortFunction);
    setListItems([...listItems]);
  }

  function handleDelete(data) {
    setEdit(null);
    setListItems(listItems.filter(item => item.LivestreamID !== data.LivestreamID));
  }

  return <>
    {canEdit && listItems && <>
      {view !== null ? <div className="LivestreamList position-relative mt-2">
          <CloseButton
            className={'position-absolute'}
            style={{top: '0px', right: '0px'}}
            onClick={() => setView(null)}
          />
          <h4>{view.LivestreamName}</h4>
          <LivestreamPanel data={view}/>
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
                onClick={() => onSortBy('LivestreamID')}
                role={'button'}
              >
                ID
                {sortKey === 'LivestreamID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('LivestreamName')}
                role={'button'}
              >
                Name
                {sortKey === 'LivestreamName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
            </tr>
            </thead>
            <tbody>
            {listItems?.map((item) => (
              <tr
                role={"button"}
                key={item.LivestreamID}
                onClick={() => setView(item)}
                className={'EditableRow'}
              >
                <td>
                  {item.LivestreamID}
                </td>
                <td className={'d-flex align-items-center position-relative'}>
                  <OverlayTrigger
                    delay={{show: 1000, hide: 500}}
                    overlay={<Tooltip>Edit livestream</Tooltip>}
                  >
                    <BsPencil
                      className={'EditPencil me-2 position-absolute'}
                      style={{left: '-20px'}}
                      onClick={(e) => {
                        setEdit(item);
                        e.stopPropagation();
                      }}
                    />
                  </OverlayTrigger>
                  {item.LivestreamName}
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
                onClick={() => setEdit({})}
              >
                Add Livestream
              </Button>
            </Col>
          </Row>
          <FormEditor>
            <LivestreamModal
              data={edit}
              show={edit !== null}
              onHide={() => setEdit(null)}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </FormEditor>
        </>}
    </>}
  </>;
}