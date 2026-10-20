import {usePageContext} from "framework/ui/content/Page";
import {useEffect, useState} from "react";
import {useRestApi} from "framework/api/RestApi";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import {Button, Col, Form, Row, Table, OverlayTrigger, Tooltip} from "react-bootstrap";
import {useSiteContext} from "framework/ui/content/Site";
import FormEditor from "framework/ui/editor/FormEditor";
import PageConfigModal from "framework/ui/editor/PageConfigModal";
import {useLocation} from "react-router";
import {BsLock, BsPencil, BsExclamationTriangle} from "react-icons/bs";
import "./Pages.css";
import {
  getCursorPercent,
  onDragLeave,
  onDragOver,
  onDragStart,
  onMouseMove,
  onDragEnd
} from "framework/ui/editor/DragUtils";
import {Outline} from "framework/util/OutlineUtil";

export default function Pages({pageId, siteId}) {

  // imports
  const {showErrorAlert} = useSiteContext();
  const {pageData} = usePageContext();
  const {Sites, Pages} = useRestApi();
  const {hasPermission} = useAuth();

  // states
  const [sites, setSites] = useState(null);
  const [currentSiteId, setCurrentSiteId] = useState(siteId ? siteId : 0);
  const [currentSiteData, setCurrentSiteData] = useState({});
  const [outlineData, setOutlineData] = useState([]);
  const [showPageProperties, setShowPageProperties] = useState(false);
  const [currentPageData, setCurrentPageData] = useState({});
  const location = useLocation();

  const canEdit = hasPermission(Resource.SITE, Permission.ADMIN);

  useEffect(() => {
    if (!sites && canEdit) {
      console.debug(`Getting site list...`);
      Sites.getSites().then(siteList => {
        console.debug(`Retrieved list of ${siteList.length} sites.`);
        siteList.sort((a, b) => a.SiteName.localeCompare(b.SiteName));
        setSites(siteList);
      }).catch(e => {
        showErrorAlert(`Error getting sites.`, e);
      })
    }
  }, [Sites, setSites, showErrorAlert, sites, canEdit]);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    if (search.has('siteId') && currentSiteId === 0) {
      const siteId = parseInt(search.get('siteId'));
      setOutlineData([]);
      setCurrentSiteId(siteId);
    }
  }, [location, setCurrentSiteId, currentSiteId]);

  useEffect(() => {
    Sites.getSite(currentSiteId)
      .then(siteData => setCurrentSiteData(siteData))
      .catch((e) => showErrorAlert(`Error getting site data.`, e));
  }, [currentSiteId, setCurrentSiteData, showErrorAlert, Sites]);

  function onAddPage() {
    setCurrentPageData({
      SiteID: currentSiteId,
      ParentID: 0,
    });
    setShowPageProperties(true);
  }

  function onEditPage(pageData) {
    setCurrentPageData(pageData);
    setShowPageProperties(true);
  }

  function onPageAdded(pageData) {
    setShowPageProperties(false);
    setOutlineData(Outline.addPage(pageData, outlineData));
    setCurrentPageData({});
  }

  function onPageDeleted(pageData) {
    setShowPageProperties(false);
    setOutlineData(Outline.deletePage(pageData, outlineData));
    setCurrentPageData({});
  }

  function onPageUpdated(pageData) {
    setShowPageProperties(false);
    setOutlineData(Outline.updatePage(pageData, outlineData));
    setCurrentPageData({});
  }

  useEffect(() => {
    if (currentSiteId > 0) {
      console.debug(`Getting site outline...`);
      Sites.getSiteOutline(currentSiteId).then(result => {
        console.debug(`Retrieved list of ${result.length} pages.`);
        setOutlineData(result);
      })
    } else {
      setOutlineData([]);
    }
  }, [currentSiteId, Sites]);


  if (!canEdit || pageId !== pageData?.PageID) {
    return <></>;
  }

  function PageContentAlert({pageData}) {
    let issues = '';
    if (!pageData.HasChildren) {
      // content page, not a menu item
      if (!pageData.PageMetaTitle) {
        issues += `<li>Missing meta title</li> `;
      }
      if (!pageData.PageMetaDescription) {
        issues += `<li>Missing meta description</li> `;
      }
      if (!pageData.PageMetaKeywords) {
        issues += `<li>Missing meta keywords</li> `;
      }
    }
    const text = issues ? `Page Issues:<ul>${issues}</ul>` : '';
    const tooltip = <Tooltip className={'Tooltip'}>
      <div
        className={'TooltipContent text-start'}
        dangerouslySetInnerHTML={{__html: text}}
      />
    </Tooltip>
    return <>
      {text && (
        <OverlayTrigger
          placement="top"
          overlay={tooltip}
          delay={{show: 1000}}
        >
          <BsExclamationTriangle
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title={text.trim()}
            className={'ms-2'}
            style={{transform: 'translateY(-10%)'}}
          />
        </OverlayTrigger>
      )}
    </>;
  }

  function onDrop(e, dropData) {
    e.target.style.borderWidth = 0;
    const percent = getCursorPercent(e, "vertical");
    const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
    if (dragData.PageID === dropData.PageID) {
      // dropped on same item
      return;
    }
    if (percent < 0.40) {
      console.debug(`Move page '${dragData.PageTitle}' before page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      setOutlineData(Outline.movePageBefore(dragData, dropData, outlineData));
      Pages.movePageBefore(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    } else if (percent < 0.60) {
      console.debug(`Make page '${dragData.PageTitle}' child of page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      setOutlineData(Outline.makeChildOf(dragData, dropData, outlineData));
      Pages.makePageChildOf(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    } else {
      console.debug(`Move page '${dragData.PageTitle}' after page '${dropData.PageTitle}'`);
      // move outline first for UI responsiveness
      setOutlineData(Outline.movePageAfter(dragData, dropData, outlineData));
      Pages.movePageAfter(dragData.PageID, dropData.PageID)
        .then(() => {
          console.debug(`Page moved.`);
        })
        .catch((err) => {
          console.error(`Error moving page.`, err);
        });
    }
    e.stopPropagation();
    e.preventDefault();
  }


  return (<div className="d-flex flex-column">
    <Row>
      <Form.Label
        column={'sm'}
        htmlFor={'Sites'}
        sm={1}
      >
        Site
      </Form.Label>
      <Col>
        <Form.Select
          name="Sites"
          size={'sm'}
          value={currentSiteId}
          onChange={(e) => {
            setCurrentSiteId(parseInt(e.target.value));
            setOutlineData([]);
          }}
        >
          <option key={0} value={0}>(Select)</option>
          {sites?.map((site) => (
            <option key={site.SiteID} value={site.SiteID}>{site.SiteName}</option>
          ))}
        </Form.Select>
      </Col>
    </Row>
    {outlineData.length > 0 && (<>
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
          >
            ID
          </th>
          <th
            className={'text-nowrap'}
          >
            Title
          </th>
          <th
            className={'text-nowrap'}
          >
            Route
          </th>
        </tr>
        </thead>
        <tbody>
        {outlineData?.map((page) => (
          <tr
            key={page.PageID}
            className={'PageRow'}
          >
            <td
              style={{
                width: '80px'
              }}
            >
              {page.PageID}
            </td>
            <td
              style={{
                paddingLeft: `${10 + page.OutlineLevel * 20}px`
              }}
              className={'d-flex flex-row align-items-center'}
            >
              <div
                className="flex-grow-1"
                style={{
                  opacity: page.PageHidden ? 0.5 : 1.0,
                  position: 'relative',
                  cursor: 'move',
                }}
              >
                <OverlayTrigger delay={{show: 500}} overlay={<Tooltip>Edit page properties.</Tooltip>}>
                  <BsPencil
                    className={'EditPencil me-2 position-absolute'}
                    style={{
                      left: '-30px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      onEditPage(page);
                      e.stopPropagation();
                    }}
                  />
                </OverlayTrigger>
                <div
                  className="swiper-no-swiping d-flex align-items-center flex-row"
                  onMouseMove={(e) => onMouseMove(e)}
                  onDragOver={(e) => onDragOver(e, page, 'vertical')}
                  onDragStart={(e) => onDragStart(e, page)}
                  onDragLeave={(e) => onDragLeave(e)}
                  onDragEnd={(e) => onDragEnd(e)}
                  onDrop={(e) => onDrop(e, page)}
                  draggable
                >
                  {page.NavTitle ? page.NavTitle : page.PageTitle ? page.PageTitle : '(no title)'}
                  {page.RequiresLogin &&
                    <BsLock size={12} className="ms-1" style={{transform: 'translateY(-10%)'}}/>
                  }
                  <PageContentAlert pageData={page}/>
                </div>
              </div>
            </td>
            <td>
              <OverlayTrigger
                delay={{show: 1000}}
                overlay={<Tooltip>View page in website.</Tooltip>}
              >
                <a href={currentSiteData.SiteRootUrl + page.PageRoute} rel="noreferrer"
                   target={"_blank"}>{page.PageRoute}</a>
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
            onClick={() => onAddPage()}
          >
            Add Page
          </Button>
        </Col>
      </Row>
      <FormEditor>
        <PageConfigModal
          show={showPageProperties}
          onHide={() => setShowPageProperties(false)}
          pageData={currentPageData}
          outlineData={outlineData}
          onUpdated={onPageUpdated}
          onDeleted={onPageDeleted}
          onAdded={onPageAdded}
        />
      </FormEditor>
    </>)}
  </div>);
}