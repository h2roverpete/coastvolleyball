import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, CloseButton, Col, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import '../css/EditableRow.css';
import {useSiteContext} from "../content/Site";
import GalleryPanel from "./GalleryPanel";
import GalleryModal from "./GalleryModal";

export default function GalleryList({siteId}) {

  // imports
  const {Galleries} = useRestApi();
  const {hasPermission} = useAuth();
  const {showErrorAlert} = useSiteContext();

  // states
  const [listItems, setListItems] = useState(/** @type {[GalleryData]} */ null);
  const [sortKey, setSortKey] = useState('GalleryName');
  const [sortAscending, setSortAscending] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [edit, setEdit] = useState(/** @type {GalleryData} */null);
  const [view, setView] = useState(/** @type {GalleryData} */null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.GALLERY, Permission.ADMIN));
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
        Galleries.getGalleriesForSite(siteId).then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting galleries.`, e);
        })
      } else {
        Galleries.getGalleries().then(result => {
          result.sort(sortFunction);
          setListItems(result);
        }).catch(e => {
          showErrorAlert(`Error getting galleries.`, e);
        })
      }
    }
  }, [Galleries, listItems, siteId, setListItems, sortFunction, canEdit, showErrorAlert]);

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
      if (item.GalleryID === newData.GalleryID) {
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
    setListItems(listItems.filter(item => item.GalleryID !== data.GalleryID));
  }

  return <>
    {canEdit && listItems && <>
      {view !== null ? <div className="GalleryList Editor position-relative mt-2">
          <CloseButton
            className={'position-absolute'}
            style={{top: '0px', right: '0px'}}
            onClick={() => setView(null)}
          />
          <h5>{view.GalleryName}</h5>
          <GalleryPanel
            galleryData={view}
            onUpdate={(data) => {
              setView(data);
              handleUpdate(data);
            }}
            onDelete={(data) => {
              setView(null);
              handleDelete(data);
            }}
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
                onClick={() => onSortBy('GalleryID')}
                role={'button'}
              >
                ID
                {sortKey === 'GalleryID' && (<span className={'ms-2'}>
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
                onClick={() => onSortBy('GalleryName')}
                role={'button'}
              >
                Name
                {sortKey === 'GalleryName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
              </th>
            </tr>
            </thead>
            <tbody>
            {listItems?.map((item) => (
              <tr
                role={"button"}
                key={item.GalleryID}
                onClick={() => setView(item)}
                className={'EditableRow'}
              >
                <td>
                  {item.GalleryID}
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
                  {item.GalleryName}
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
                Add Gallery
              </Button>
            </Col>
          </Row>
          <FormEditor>
            <GalleryModal
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