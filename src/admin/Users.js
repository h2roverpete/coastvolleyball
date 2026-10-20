import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {useSiteContext} from "framework/ui/content/Site";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, Col, Modal, Row, Table} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import UserConfig from "framework/auth/UserConfig";
import {Permission, Resource} from "framework/auth/Permissions";
import {useAuth} from "framework/auth/AuthProvider";

export default function Users({pageId}) {

  const {Users} = useRestApi();
  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth()

  const [users, setUsers] = useState(null);
  const [sortKey, setSortKey] = useState('UserName');
  const [sortAscending, setSortAscending] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.USERS, Permission.ADMIN));
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
    if (!users && canEdit) {
      Users.getUsers().then(userList => {
        userList.sort(sortFunction);
        setUsers(userList);
      }).catch(e => {
        console.error(`Error getting users.`, e);
      })
    } else if (users) {
      setUsers(users.sort(sortFunction));
    }
  }, [Users, setUsers, sortAscending, sortKey, canEdit, users, sortFunction]);

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

  function onEditUser(user) {
    setEditUser(user);
  }

  function onAddUser() {
    setEditUser({});
  }

  function onUpdateUser(updatedUser) {
    // update user list
    let updated = false;
    users.forEach((user, index) => {
      if (user.UserID === updatedUser.UserID) {
        // update data
        users[index] = {...updatedUser};
        updated = true;
      }
    });
    if (!updated) {
      // user added, not updated
      users.push(updatedUser);
    }
    users.sort(sortFunction);
    setUsers([...users]);
    setEditUser(null);
  }

  function onDeleteUser(deleteUser) {
    // update site list
    const filteredUsers = users.filter(user => user.UserID !== deleteUser.UserID);
    setUsers(filteredUsers);
    setEditUser(null);
  }

  function onCancelEdit() {
    setEditUser(null);
  }

  return (<>
      {currentPage?.PageID === pageId && canEdit && (<>
        <Table
          hover
          responsive
          style={{
            height: 'auto',
            flexGrow: 1,
            overflowY: 'scroll'
          }}
        >
          <thead style={{position: 'sticky', top: 0}}>
          <tr>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('SiteID')}
              style={{cursor: 'pointer'}}
            >
              Site ID
              {sortKey === 'SiteID' && (
                <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>)}
            </th>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('UserName')}
              style={{cursor: 'pointer'}}
            >
              User Name
              {sortKey === 'UserName' && (
                <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>)}
            </th>
            <th
              className={'text-nowrap'}
              onClick={() => onSortBy('UserEmail')}
              style={{cursor: 'pointer'}}
            >
              Email
              {sortKey === 'UserEmail' && (
                <span className={'ms-2'}>{sortAscending ? <BsSortDown/> : <BsSortUp/>}</span>)}
            </th>
          </tr>
          </thead>
          <tbody>
          {users?.map((user) => (
            <tr key={user.UserID}>
              <td
                style={{cursor: "pointer"}}
                onClick={() => onEditUser(user)}
              >
                {user.SiteID}
              </td>
              <td
                style={{cursor: "pointer"}}
                onClick={() => onEditUser(user)}
              >
                {user.UserName}
              </td>
              <td
                style={{cursor: "pointer"}}
                onClick={() => onEditUser(user)}
              >
                {user.UserEmail}
              </td>
            </tr>
          ))}
          </tbody>
        </Table>
        <Modal show={editUser !== null}>
          <FormEditor>
            <UserConfig
              userData={editUser}
              onDelete={onDeleteUser}
              onUpdate={onUpdateUser}
              onCancel={onCancelEdit}
              className={'p-3'}
            />
          </FormEditor>
        </Modal>
        <Row className="mt-2">
          <Col>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAddUser()}
            >
              Add User
            </Button>
          </Col>
        </Row>
      </>)}
    </>
  );
}