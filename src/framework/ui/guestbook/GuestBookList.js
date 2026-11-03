import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, CloseButton, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import '../css/EditableRow.css';
import {useSiteContext} from "../content/Site";
import GuestBookConfigModal from "./GuestBookConfigModal";
import GuestManagement from "./GuestManagement";

export default function GuestBookList({siteId}) {

  // imports
  const {GuestBooks} = useRestApi();
  const {hasPermission} = useAuth();
  const {showErrorAlert} = useSiteContext();

  // states
  const [listItems, setListItems] = useState(/** @type {[GuestBookConfig]} */ null);
  const [sortKey, setSortKey] = useState('GuestBookName');
  const [sortAscending, setSortAscending] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [edit, setEdit] = useState(/** @type {GuestBookConfig} */null);
  const [view, setView] = useState(/** @type {GuestBookConfig} */null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.GUESTBOOK, Permission.ADMIN));
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
      if (siteId) {
        GuestBooks.getGuestBooksForSite(siteId).then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting guest books.`, e);
        })
      } else {
        GuestBooks.getGuestBooks().then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting guest books.`, e);
        })
      }
    }
  }, [GuestBooks, listItems, setListItems, sortFunction, canEdit, showErrorAlert]);

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

  function handleUpdate(newData) {
    let updated = false;
    listItems.forEach((item, index) => {
      if (item.GuestBookID === newData.GuestBookID) {
        // update data
        listItems[index] = {...newData};
        updated = true;
      }
    });
    if (!updated) {
      // item was added, not updated
      listItems.push(newData);
    }
    listItems.sort(sortFunction);
    setListItems([...listItems]);
  }

  function handleDelete(data) {
    setListItems(listItems.filter(item => item.GuestBookID !== data.GuestBookID));
  }

  return <>
    {canEdit && listItems && <>
      {view !== null ? <div className="GuestBookList Editor position-relative mt-2">
          <CloseButton
            className={'position-absolute'}
            style={{top: '0px', right: '0px'}}
            onClick={() => setView(null)}
          />
          <h5>{view.GuestBookName}</h5>
          <GuestManagement
            data={view}
          />
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
                onClick={() => onSortBy('GuestBookID')}
                role={'button'}
              >
                ID
                {sortKey === 'GuestBookID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              {!siteId &&
                <th
                  className={'text-nowrap'}
                  onClick={() => onSortBy('SiteID')}
                  role={'button'}
                >
                  Site ID
                  {sortKey === 'SiteID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
                </th>
              }
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('GuestBookName')}
                role={'button'}
              >
                Name
                {sortKey === 'GuestBookName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
            </tr>
            </thead>
            <tbody>
            {listItems?.map((item) => (
              <tr
                role={"button"}
                key={item.GuestBookID}
                onClick={() => setView(item)}
                className={'EditableRow'}
              >
                <td>
                  {item.GuestBookID}
                </td>
                {!siteId &&
                  <td>
                    {item.SiteID}
                  </td>
                }
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
                  {item.GuestBookName}
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
                Add a Guest Book
              </Button>
            </Col>
          </Row>
          <FormEditor>
            <GuestBookConfigModal
              data={edit}
              siteId={siteId}
              show={edit !== null}
              onHide={() => setEdit(null)}
              onUpdate={(data) => {
                setEdit(null);
                handleUpdate(data);
              }}
              onDelete={(data) => {
                setEdit(null);
                handleDelete(data);
              }}
            />
          </FormEditor>
        </>}
    </>}
  </>;
}