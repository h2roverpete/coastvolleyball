import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {useSiteContext} from "framework/ui/content/Site";
import {BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, Col, Modal, Row, Table} from "react-bootstrap";
import FormEditor from "../framework/ui/editor/FormEditor";
import ClientConfig from "./ClientConfig";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";

export default function AuthClients({pageId}) {

  const {Auth} = useRestApi();
  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth();

  const [clients, setClients] = useState(null);
  const [sortKey, setSortKey] = useState('client_id');
  const [sortAscending, setSortAscending] = useState(true);
  const [editClient, setEditClient] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

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
    if (!clients && canEdit) {
      Auth.getAuthClients().then(clientList => {
        clientList.sort(sortFunction);
        setClients(clientList);
      }).catch(e => {
        console.error(`Error getting auth clients.`, e);
      })
    } else if (clients) {
      setClients(clients.sort(sortFunction));
    }
  }, [Auth, setClients, sortAscending, sortKey, canEdit, clients, sortFunction]);

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

  function handleEdit(client) {
    setEditClient(client);
  }

  function handleAdd() {
    setEditClient({});
  }

  function handleUpdate(updatedClient) {
    // update site list
    let updated = false;
    clients.forEach((client, index) => {
      if (client.client_id === updatedClient.client_id) {
        // update data
        clients[index] = {...updatedClient};
        updated = true;
      }
    });
    if (!updated) {
      // site added, not updated
      clients.push(updatedClient);
    }
    clients.sort(sortFunction);
    setClients([...clients]);
    setEditClient(null);
  }

  function handleDelete(deleteClient) {
    // update site list
    const filtered = clients.filter(client => client.client_id !== deleteClient.client_id);
    setClients(filtered);
    setEditClient(null);
  }

  function handleCancel() {
    setEditClient(null);
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
        <thead style={{position: 'sticky', top: 0,}}>
        <tr>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('client_id')}
            style={{cursor: 'pointer'}}
          >
            Client ID
            {sortKey === 'client_id' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('redirect_uri')}
            style={{cursor: 'pointer'}}
          >
            Redirect URI
            {sortKey === 'redirect_uri' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
        </tr>
        </thead>
        <tbody>
        {clients?.map((client) => (
          <tr key={client.client_id}>
            <td
              style={{cursor: "pointer"}}
              onClick={() => handleEdit(client)}
            >
              {client.client_id}
            </td>
            <td
              style={{cursor: "pointer"}}
              onClick={() => handleEdit(client)}
            >
              {client.redirect_uri}
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
            onClick={() => handleAdd()}
          >
            Add Client
          </Button>
        </Col>
      </Row>
      <Modal show={editClient !== null}>
        <FormEditor>
          <ClientConfig
            clientData={editClient}
            clientList={clients}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            className={'p-3'}
          />
        </FormEditor>
      </Modal>
    </>)}
  </>);
}