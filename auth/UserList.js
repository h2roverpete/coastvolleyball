import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, CloseButton, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import './UserList.css';
import '../ui/css/EditableRow.css'
import {useSiteContext} from "../ui/content/Site";
import UserModal from "./UserModal";
import UserPanel from "./UserPanel";

export default function UserList({siteId}) {

  // imports
  const {Users} = useRestApi();
  const {hasPermission} = useAuth();
  const {showErrorAlert} = useSiteContext();

  // states
  const [listItems, setListItems] = useState(/** @type {[NewUserData]} */ null);
  const [sortKey, setSortKey] = useState('UserName');
  const [sortAscending, setSortAscending] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [edit, setEdit] = useState(/** @type {NewUserData} */null);
  const [view, setView] = useState(/** @type {NewUserData} */null);

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
      if (siteId) {
        Users.getSiteUsers(siteId).then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting users.`, e);
        })
      } else {
        Users.getUsers().then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting users.`, e);
        })
      };
    }
  }, [Users, listItems, setListItems, sortFunction, canEdit, showErrorAlert]);

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
    listItems.forEach((item, index) => {
      if (item.UserID === newData.UserID) {
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
    setListItems(listItems.filter(item => item.UserID !== data.UserID));
  }

  return <>
    {canEdit && listItems && <>
      {view !== null ? <div className="UserList position-relative mt-2">
          <CloseButton
            className={'position-absolute'}
            style={{top: '0px', right: '0px'}}
            onClick={() => setView(null)}
          />
          <h4>{view.UserName}</h4>
          <UserPanel data={view}/>
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
                onClick={() => onSortBy('UserID')}
                role={'button'}
              >
                ID
                {sortKey === 'UserID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
              <th
                className={'text-nowrap'}
                onClick={() => onSortBy('UserName')}
                role={'button'}
              >
                Name
                {sortKey === 'UserName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
            </tr>
            </thead>
            <tbody>
            {listItems?.map((item) => (
              <tr
                role={"button"}
                key={item.UserID}
                onClick={() => setView(item)}
                className={'EditableRow'}
              >
                <td>
                  {item.UserID}
                </td>
                <td className={'d-flex align-items-center position-relative'}>
                  <OverlayTrigger
                    delay={{show: 1000, hide: 500}}
                    overlay={<Tooltip>Edit user</Tooltip>}
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
                  {item.UserName}
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
                Add User
              </Button>
            </Col>
          </Row>
          <FormEditor>
            <UserModal
              siteId={siteId}
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