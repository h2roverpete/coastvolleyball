import {useRestApi} from "framework/api/RestApi";
import {useSiteContext} from "framework/ui/content/Site";
import {useAuth} from "framework/auth/AuthProvider";
import {useNavigate} from "react-router";
import {useCallback, useEffect, useState} from "react";
import FormEditor from "framework/ui/editor/FormEditor";
import {
  OverlayTrigger,
  Table,
  Tooltip
} from "react-bootstrap";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import GuestBookConfigModal from "framework/ui/guestbook/GuestBookConfigModal";
import {Permission, Resource} from "framework/auth/Permissions";
import '../framework/ui/css/EditableRow.css';

export default function GuestBooks({pageId}) {

  // imports
  const {GuestBooks} = useRestApi();
  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth();
  const navigate = useNavigate();

  // states
  const [guestBooks, setGuestBooks] = useState([]);
  const [guestBookConfig, setGuestBookConfig] = useState(null);
  const [sortKey, setSortKey] = useState('GuestBookID');
  const [sortAscending, setSortAscending] = useState(true);
  const [editGuestBook, setEditGuestBook] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // refs

  // hooks

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
    // load & sort guest book list
    GuestBooks.getGuestBooks()
      .then((result) => {
        result.sort((a, b) => sortFunction(a, b));
        setGuestBooks(result);
      })
  }, [GuestBooks, setGuestBooks, sortFunction]);

  useEffect(() => {
    // sort guest book list on change
    setGuestBooks(prevValue => [...prevValue.sort((a, b) => sortFunction(a, b))]);
  }, [setGuestBooks, sortKey, sortAscending, sortFunction]);

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

  function onEditGuestBook(guestBookConfig) {
    setGuestBookConfig(guestBookConfig)
    setEditGuestBook(true);
  }

  function onGuestBookUpdated(guestBookConfig) {
    const newGuestBooks = guestBooks.map((config) => {
      if (config.GuestBookID === guestBookConfig.GuestBookID) {
        return guestBookConfig;
      } else {
        return config;
      }
    });
    newGuestBooks.sort(sortFunction);
    setGuestBooks([...newGuestBooks]);
  }

  function onGuestBookDeleted(guestBookConfig) {
    const newGuestBooks = guestBooks.filter((config) => {
      return config.GuestBookID !== guestBookConfig.GuestBookID;
    });
    setGuestBooks([...newGuestBooks]);
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
            onClick={() => onSortBy('GuestBookID')}
            style={{cursor: 'pointer'}}
          >
            ID
            {sortKey === 'GuestBookID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('GuestBookName')}
            style={{cursor: 'pointer'}}
          >
            Guest Book Name
            {sortKey === 'GuestBookName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('SiteID')}
            style={{cursor: 'pointer'}}
          >
            Site
            {sortKey === 'SiteID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('GuestBookEmail')}
            style={{cursor: 'pointer'}}
          >
            Admin Email
            {sortKey === 'GuestBookEmail' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
        </tr>
        </thead>
        <tbody>
        {guestBooks?.map((guestBookConfig, index) => (
          <tr
            key={guestBookConfig.GuestBookID}
            className={'EditableRow'}
            onClick={() => navigate(`/guests?guestbookid=${guestBookConfig.GuestBookID}`)}
          >
            <td
              style={{cursor: "pointer"}}
              onClick={() => onEditGuestBook(guestBookConfig)}
            >
              {guestBookConfig.GuestBookID}
            </td>
            <td
              style={{cursor: "pointer"}}
              className={'GuestBookCell d-flex flex-row align-items-center position-relative'}
            >
              <OverlayTrigger
                delay={{show: 1000, hide: 500}}
                overlay={<Tooltip>Edit guest book properties.</Tooltip>}
              >
                <BsPencil
                  className={'EditPencil me-2 position-absolute'}
                  style={{left: '-20px'}}
                  onClick={(e) => {
                    onEditGuestBook(guestBookConfig);
                    e.stopPropagation();
                  }}
                />
              </OverlayTrigger>
              {guestBookConfig.GuestBookName ? guestBookConfig.GuestBookName : '(No name)'}
            </td>
            <td
              style={{cursor: "pointer"}}
            >
              {guestBookConfig.SiteID}
            </td>
            <td
              style={{cursor: "pointer"}}
            >
              {guestBookConfig.GuestBookEmail}
            </td>
          </tr>
        ))}
        </tbody>
      </Table>
      <FormEditor>
        <GuestBookConfigModal
          guestBookConfig={guestBookConfig}
          show={editGuestBook}
          onHide={() => {
            setGuestBookConfig(null);
            setEditGuestBook(false);
          }}
          onUpdate={onGuestBookUpdated}
          onDelete={onGuestBookDeleted}
        />
      </FormEditor>
    </>)}
  </>);

}