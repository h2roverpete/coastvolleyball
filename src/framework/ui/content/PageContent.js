import React, {lazy, Suspense, useCallback, useEffect, useRef, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {usePageContext} from "./Page";
import './PageContent.css';
import {Button, Spinner} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "./Site";
import {jwtDecode} from "jwt-decode";
import {useCookies} from "react-cookie";

const RestrictedContent = lazy(() => import("../../auth/RestrictedContent"));
const PagePassword = lazy(() => import("./PagePassword"));

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
  const [canView, setCanView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const {PageSections, Pages} = useRestApi();
  const [cookies, setCookie, removeCookie] = useCookies();
  const canEdit = hasPermission(Resource.PAGE, Permission.EDIT);

  const checkPassword = useCallback(async (pageId) => {
    if (pageId && cookies && Pages) {
      const token = cookies[`page${pageId}token`];
      if (token) {
        // decode token and validate
        const decoded = await jwtDecode(token.access_token);
        if (decoded) {
          const t = Math.floor(Date.now() / 1000);
          if (decoded.exp > t) {
            // token is current, check page ID
            return decoded.PageID === pageId
          } else {
            console.warn(`Expired page token, refreshing...`);
            setRefreshingToken(true);
            try {
              const newToken = await Pages.refreshPageToken(pageId, token.refresh_token);
              console.debug(`Page token refreshed successfully.`);
              setCookie(`page${pageId}token`, newToken);
              setRefreshingToken(false);
              return true;
            } catch (err) {
              console.error(`Error refreshing page token.`);
              removeCookie(`page${pageId}token`);
              setRefreshingToken(false);
              return false;
            }
          }
        }
      }
    }
    return false;
  }, [cookies, Pages, setCookie, removeCookie]);

  useEffect(() => {
    if (!canView && pageData && hasPermission) {
      if (pageData.RequiresPassword) {
        // check if user is logged in with admin permission
        if (hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED)) {
          setCanView(true);
        } else {
          // not admin, check page password
          checkPassword(pageData.PageID).then((result) => {
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
  }, [pageData, hasPermission, setCanView, canView, checkPassword]);

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
          <Suspense>
            <PagePassword
              onSuccess={() => setCanView(true)}
              pageData={pageData}
              refreshingToken={refreshingToken}
            />
          </Suspense>
          : pageData?.RequiresLogin && <div className={'PageContent container-fluid'}>
          <h1>Restricted Content</h1>
          <Suspense><RestrictedContent/></Suspense>
        </div>
      }
    </>}
  </>);
}