import {useCallback, useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {useSiteContext} from "framework/ui/content/Site";
import {BsPencil, BsSortDown, BsSortUp} from "react-icons/bs";
import {Button, Col, Modal, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import SiteConfig from "framework/ui/editor/SiteConfig";
import FormEditor from "framework/ui/editor/FormEditor";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import {Link, useNavigate} from "react-router";
import './Sites.css';

export default function Sites({pageId}) {

  // imports
  const {Sites} = useRestApi();
  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth();
  const navigate = useNavigate();

  // states
  const [sites, setSites] = useState([]);
  const [sortKey, setSortKey] = useState('SiteID');
  const [sortAscending, setSortAscending] = useState(true);
  const [editSite, setEditSite] = useState(null);
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
    Sites.getSites().then(result => {
      result.sort(sortFunction);
      setSites(result);
    }).catch(e => {
      console.error(`Error getting sites.`, e);
    })
  }, [Sites, setSites, sortFunction]);

  useEffect(() => {
    setSites(prevValue => [...prevValue.sort(sortFunction)]);
  }, [sortKey, sortAscending, sortFunction]);

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

  function onEditSite(site) {
    setEditSite(site);
  }

  function onAddSite() {
    setEditSite({});
  }

  function onUpdateSite(updatedSite) {
    // update site list
    let updated = false;
    sites.forEach((site, index) => {
      if (site.SiteID === updatedSite.SiteID) {
        // update data
        sites[index] = {...updatedSite};
        updated = true;
      }
    });
    if (!updated) {
      // site added, not updated
      sites.push(updatedSite);
    }
    sites.sort(sortFunction);
    setSites([...sites]);
    setEditSite(null);
  }

  function onDeleteSite(deleteSite) {
    // update site list
    const filteredSites = sites.filter(site => site.SiteID !== deleteSite.SiteID);
    setSites(filteredSites);
    setEditSite(null);
  }

  function onCancelEdit() {
    setEditSite(null);
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
            onClick={() => onSortBy('SiteID')}
            style={{cursor: 'pointer'}}
          >
            ID
            {sortKey === 'SiteID' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('SiteName')}
            style={{cursor: 'pointer'}}
          >
            Site Name
            {sortKey === 'SiteName' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
          <th
            className={'text-nowrap'}
            onClick={() => onSortBy('SiteRootUrl')}
            style={{cursor: 'pointer'}}
          >
            Root URL
            {sortKey === 'SiteRootUrl' && (<span className={'ms-2'}>
            {sortAscending ? <BsSortDown/> : <BsSortUp/>}
          </span>)}
          </th>
        </tr>
        </thead>
        <tbody>
        {sites?.map((site) => (
          <tr
            key={site.SiteID}
            className={'SiteRow'}
          >
            <td
              style={{cursor: "pointer"}}
              onClick={() => onEditSite(site)}
            >
              {site.SiteID}
            </td>
            <td
              style={{cursor: "pointer"}}
              className={'d-flex flex-row align-items-center position-relative'}
              onClick={() => navigate(`/pages?siteId=${site.SiteID}`)}
            >
              <OverlayTrigger
                delay={{show: 1000}}
                overlay={<Tooltip>Edit site properties.</Tooltip>}
              >
                <BsPencil
                  className={'EditPencil me-2 position-absolute'}
                  style={{left: '-20px'}}
                  onClick={(e) => {
                    onEditSite(site);
                    e.stopPropagation();
                  }}
                />
              </OverlayTrigger>
              <OverlayTrigger
                delay={{show: 1000}}
                overlay={<Tooltip>View site pages.</Tooltip>}
              >
                <div>{site.SiteName ? site.SiteName : '(No name)'}</div>
              </OverlayTrigger>
            </td>
            <td>
              <OverlayTrigger
                delay={{show: 1000}}
                overlay={<Tooltip>Browse in a new window.</Tooltip>}
              >
                <Link to={site.SiteRootUrl} target={'blank'}>{site.SiteRootUrl ? site.SiteRootUrl : '(No URL)'}</Link>
              </OverlayTrigger>
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
            onClick={() => onAddSite()}
          >
            Add Site
          </Button>
        </Col>
      </Row>
      <Modal show={editSite !== null}>
        <FormEditor>
          <SiteConfig
            siteData={editSite}
            onDelete={onDeleteSite}
            onUpdate={onUpdateSite}
            onCancel={onCancelEdit}
            className={'p-3'}
          />
        </FormEditor>
      </Modal>
    </>)}
  </>);
}