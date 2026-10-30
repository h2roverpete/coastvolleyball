import React, {useEffect, useRef, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {usePageContext} from "./Page";
import RestrictedContent from "../../auth/RestrictedContent";
import './PageContent.css';
import PagePassword from "./PagePassword";
import {Button, Spinner} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "./Site";

/**
 * Element to show page content
 *
 * A <div> element with class names "content container"
 *
 * @param children{[JSX.Element]}   Elements to add at the end of page content.
 * @constructor
 */
export default function PageContent({children}) {

  const {hasPermission} = useAuth();
  const {siteData, showErrorAlert} = useSiteContext();
  const {pageData, sectionData, setSectionData} = usePageContext();
  const passwordApi = useRef(null);
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const {PageSections} = useRestApi();

  useEffect(() => {
    if (!canView && pageData && hasPermission) {
      if (pageData.RequiresPassword && passwordApi.current) {
        // check if user is logged in with admin permission
        if (hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED)) {
          setCanView(true);
        } else {
          // not admin, check page password
          passwordApi.current.canView().then((result) => {
            setCanView(result);
          });
        }
      } else if (pageData.RequiresLogin) {
        // check if user is logged in with browse permission
        setCanView(hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED));
      } else {
        // no protection
        setCanView(true);
      }
    }
    setCanEdit(hasPermission(Resource.PAGE, Permission.EDIT));
  }, [pageData, hasPermission, setCanView, setCanEdit, canView]);

  function addPageSection() {
    setBusy(true);
    PageSections.insertOrUpdatePageSection({
      PageID: pageData.PageID,
      PageSectionSeq: 1,
    }).then((newSection) => {
      setSectionData([newSection]);
      setBusy(false);
    }).catch(error => {
      showErrorAlert(`Error adding section.`, error);
      setBusy(false);
    });
  }

  return (<>
    {pageData && <>
      {canView ?
        <div className="PageContent container-fluid" data-testid="PageContent">
          {children}
          {canEdit && sectionData?.length === 0 && pageData.PageID > 0 &&
            <div className={'w-100'}>
              <Button
                variant={siteData?.SiteTheme}
                className={'mt-3 mb-3'}
                style={{width: '150px'}}
                size={'sm'}
                onClick={addPageSection}
              >
                {busy ? <Spinner size={'sm'}></Spinner> : <>Add Page Section</>}
              </Button>
            </div>
          }
        </div>
        :
        pageData?.RequiresPassword ?
          <PagePassword onSuccess={() => setCanView(true)} pageData={pageData} apiRef={passwordApi}/>
          : pageData?.RequiresLogin &&
          <RestrictedContent/>
      }
    </>}
  </>);
}