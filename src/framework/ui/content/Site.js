import React, {createContext, lazy, Suspense, useCallback, useContext, useEffect, useState} from 'react';
import ReactGA from 'react-ga4';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import {Route, Routes, useLocation} from "react-router";
import {useRestApi} from "../../api/RestApi";
import Logout from '../../auth/Logout';
import {Alert, Spinner} from "react-bootstrap";
import Head from "./Head";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import Login from "../../auth/Login";
import Error404 from "../../util/Error404";
import SiteUsers from "../../auth/SiteUsers";
import UserProfilePanel from "../../auth/UserProfilePanel";
import {Outline} from "framework/util/OutlineUtil"
import SmsAdminPage from "../sms/SmsAdminPage";
import './Site.css';

const SiteEditor = lazy(() => import("../editor/SiteEditor"));

/**
 * @typedef ErrorData
 *
 * @property {String} title
 * @property {String} description
 */

export const SiteContext = createContext({});

/**
 * @typedef MetaPage
 * @property {string} name
 * @property {string} path
 * @property {JSX.Element} content
 */

/**
 * @typedef SiteProps
 *
 * @property {string} googleId            ID for Google tracking tag.
 * @property {JSX.Element} pageElement    Element to use for displaying page contents.
 * @property {[JSX.Element]} children     Child elements.
 */

/**
 * Main container element of content framework.
 * Performs routing for page rendering.
 * Provides SiteContext to child elements.
 *
 * @param props {SiteProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function Site(props) {

  // imports
  const location = useLocation();
  const {Sites} = useRestApi();
  const {hasPermission} = useAuth();

  // states
  const [siteData, setSiteData] = useState(/** @type SiteData */ null);
  const [outlineData, setOutlineData] = useState(/** @type {[OutlineData]|null} */ null);
  const [alert, setAlert] = useState('');
  const [currentPage, setCurrentPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [canBrowseProtected, setCanBrowseProtected] = useState(false);
  const [metaPages] = useState([
    {name: 'user', id: -1, title: 'User Profile', path: '/admin/user', content: <UserProfilePanel/>},
    {name: 'users', id: -2, title: 'Site Users', path: '/admin/users', content: <SiteUsers/>},
    {name: 'sms', id: -3, title: 'SMS Campaign Administration', path: '/admin/sms', content: <SmsAdminPage/>},
    {name: 'login', id: -4, title: 'Log In', path: '/login', content: <Login/>},
    {name: 'logout', id: -5, title: 'Log Out', path: '/logout', content: <Logout/>},
    {name: 'error', id: -6, title: 'Error 404 - Not Found', path: '*', content: <Error404/>},
  ]);
  const [redirect, setRedirect] = useState(0);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.SITE, Permission.EDIT));
    setCanBrowseProtected(hasPermission?.(Resource.PAGE, Permission.BROWSE_PROTECTED));
  }, [setCanEdit, setCanBrowseProtected, hasPermission]);

  const params = new URLSearchParams(window.location.search);
  let cfmPageId = parseInt(params.get('pageid'));

  useEffect(() => {
    if (siteData?.SiteTheme) {
      document.documentElement.setAttribute('data-bs-theme', siteData.SiteTheme);
    }
  }, [siteData]);

  useEffect(() => {
    // get current page and breadcrumbs from new pathname
    if (outlineData) {
      console.debug(`Update current page.`);
      if (location.pathname === '/') {
        if (redirect > 0) {
          // find redirect page
          for (const page of outlineData) {
            if (page.PageID === redirect) {
              setCurrentPage(page);
              const crumbs = buildBreadcrumbs(outlineData, page.ParentID);
              setBreadcrumbs(crumbs);
              console.debug(`Redirect current page to ${page.PageID}.`);
              return;
            }
          }
          // redirect not found, fall through to home page
        }
        // set home page
        setCurrentPage(outlineData[0]);
        console.debug(`Set current page to home page.`);
      } else {
        for (const page of outlineData) {
          if (page.PageRoute === location.pathname || page.PageID === cfmPageId) {
            setCurrentPage(page);
            const crumbs = buildBreadcrumbs(outlineData, page.ParentID);
            setBreadcrumbs(crumbs);
            console.debug(`Set current page to ${page.PageID}.`);
            return;
          }
        }
        for (const page of metaPages) {
          if (page.path === location.pathname || page.path === "*") {
            // current page or fallback page
            setCurrentPage({PageID: page.id, PageTitle: page.title, PageContent: page.content});
            return;
          }
        }
        // page not found in outline or meta pages
        setCurrentPage({PageID: 0});
      }
    }
  }, [location.pathname, metaPages, outlineData, setCurrentPage, cfmPageId, redirect]);

  useEffect(() => {
    // Google Analytics, if provided.
    if (siteData?.GoogleClientID) {
      ReactGA.initialize(siteData.GoogleClientID);
    }
  }, [siteData]);

  /**
   * Display an error alert.
   *
   * Meant to be a replacement for console.error(text,Error)
   * or just pass the Error.
   *
   * @param {Error | String} error    Prompt string or Error.
   * @param {Error} exception         Error to show after prompt string.
   */
  const showErrorAlert = useCallback((error, exception) => {
    let msg;
    if (typeof error === 'string' || error instanceof String) {
      if (alert !== error) {
        msg = `${error} ${exception?.response?.data?.message ? exception.response.data.message : exception.message ? exception.message : ''}`;
      }
    } else if (error?.response?.data?.message) {
      //
      msg = error.response.data.message;
    } else if (error.message) {
      msg = error.message;
    }
    if (msg && alert !== msg) {
      setAlert(msg);
    }
  }, [alert]);

  function onAlertClose() {
    setAlert(null);
  }

  const alertElement = alert?.length > 0 ?
    <Alert
      dismissible={true}
      onClose={onAlertClose}
      variant="danger"
      style={{
        position: 'fixed',
        bottom: 0,
      }}
    >
      {alert}
    </Alert>
    : <></>;

  useEffect(() => {
    if (!siteData) {
      // load site data
      Sites.getSite().then((data) => {
        console.debug(`Loaded site ${data.SiteID}.`);
        setSiteData(data);
      }).catch(err => console.error(`Error loading site.`, err));
    }
  }, [Sites, siteData]);

  useEffect(() => {
    if (!outlineData) {
      // load site outline
      Sites.getSiteOutline().then((data) => {
        console.debug(`Loaded site outline.`);
        setOutlineData(buildOutline(data));
      }).catch(err => console.error(`Error loading outline.`, err));
    }
  }, [Sites, outlineData]);

  useEffect(() => {
    if (props.redirects && window.location.pathname === '/') {
      // search for page redirect matches
      for (const item of props.redirects) {
        if (item.hostname === window.location.hostname) {
          console.debug(`Setting redirect ${item.hostname} to page ${item.pageId}.`);
          setRedirect(item.pageId)
        }
      }
    }
  }, [props.redirects, setRedirect])


  useEffect(() => {
    // build next & prev page for navigation
    if (currentPage && outlineData) {
      let before;
      let current;
      let after;
      for (const page of outlineData) {
        if (page.PageID === currentPage.PageID) {
          current = page;
        } else if (current && !page.HasChildren && !page.PageHidden && (!page.RequiresLogin || hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED))) {
          after = page;
          break;
        } else if (!page.HasChildren && !page.PageHidden && (!page.RequiresLogin || hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED))) {
          before = page;
        }
      }
      setPrevPage(before);
      setNextPage(after);
    }
  }, [outlineData, currentPage, hasPermission]);

  // set up routes (or catchall if outline is not yet loaded)
  const content = outlineData ? (
    <Routes>
      {outlineData && (<>
        {cfmPageId && (
          // legacy coldfusion page
          <Route
            path="/page.cfm"
            element={<props.pageElement pageId={cfmPageId}/>}
          />
        )}
        {redirect ? (
          // redirect root for an alternate domain
          <Route
            path="/"
            element={<props.pageElement pageId={redirect.pageId}/>}
          />
        ) : (<>
          {outlineData?.length > 0 && (
            <Route
              path="/"
              element={<props.pageElement pageId={outlineData[0].PageID}/>}
            />
          )}
        </>)}
        {outlineData.map((page) => (
          // all pages in site outline
          <Route
            path={page.PageRoute}
            element={<props.pageElement pageId={page.PageID}/>}
          />
        ))}
        {metaPages.map((meta) => (
          <Route
            path={meta.path}
            element={<props.pageElement pageId={meta.id}/>}
          />
        ))}
      </>)}
      {props.children}
    </Routes>
  ) : (
    <Routes>
      <Route
        path={'*'}
        element={<></>}
      />
      {props.children}
    </Routes>
  )

  const siteContext = {
    siteData: siteData,
    setSiteData: setSiteData,
    Outline: {
      deletePage: (pageData) => setOutlineData(Outline.deletePage(pageData, outlineData)),
      addPage: (pageData) => setOutlineData(Outline.addPage(pageData, outlineData)),
      movePageBefore: (page1, page2) => setOutlineData(Outline.movePageBefore(page1, page2, outlineData)),
      movePageAfter: (page1, page2) => setOutlineData(Outline.movePageAfter(page1, page2, outlineData)),
      makeChildOf: (page1, page2) => setOutlineData(Outline.makeChildOf(page1, page2, outlineData)),
      updatePage: (pageData) => setOutlineData(Outline.updatePage(pageData, outlineData))
    },
    outlineData: outlineData,
    metaPages: metaPages,
    showErrorAlert: showErrorAlert,
    getChildren: (pageId) => Outline.getChildren(pageId, outlineData, false, canBrowseProtected),
    currentPage: currentPage,
    prevPage: prevPage,
    nextPage: nextPage,
    breadcrumbs: breadcrumbs,
    buildBreadcrumbs: buildBreadcrumbs,
  };

  if (canEdit) {
    return (
      <SiteContext value={siteContext}>
        <Head/>
        <Suspense fallback={<div className={'PageLoading'}><Spinner/></div>}>
          <SiteEditor>
            <div className="Site" data-testid="Site">
              {content}
              {alertElement}
            </div>
          </SiteEditor>
        </Suspense>
      </SiteContext>
    );
  } else {
    return (
      <SiteContext value={siteContext}>
        <Head/>
        <div className="Site" data-testid="Site">
          {content}
          {alertElement}
        </div>
      </SiteContext>
    );
  }
}

export function useSiteContext() {
  return useContext(SiteContext)
}

/**
 * Build or rebuild the site outline in the proper sequence
 * from an unsorted array of page data.
 *
 * @param pages {[OutlineData]}   Array of page data (arbitrary sort order)
 * @param [parentId] {number}     Parent page ID.
 * @param [level] {number}        Level number, also a trigger to recurse through all children.
 * @param [parent] {*&{HasChildren: boolean, OutlineLevel: number, OutlineSort: string}}  Parent data.
 * @returns {[OutlineData]}       Outline built from page data
 */
function buildOutline(pages, parentId, level, parent) {
  parentId = parentId ? parentId : 0;
  level = level ? level : 0;
  let result = [];
  pages.map((page) => {
    if (page.ParentID === parentId) {
      // copy outline data fields
      const child = {
        ...page,
        HasChildren: false, // will be reset to true if children are found
        OutlineLevel: level,
        OutlineSort: setCharAt(parent ? parent.OutlineSort : '0'.repeat(20), level * 2, page.OutlineSeq.toString().padStart(2, "0"))
      }
      result.push(child);
      result = result.concat(buildOutline(pages, child.PageID, level + 1, child));
    }
    return true; // make eslint happy
  })
  if (result.length > 0 && parent) parent.HasChildren = true;
  result.sort((a, b) => a.OutlineSort.localeCompare(b.OutlineSort));
  return result;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

/**
 * Build breadcrumb array from site outline.
 *
 * @param outlineData {[OutlineData]}
 * @param parentId {number}
 */
function buildBreadcrumbs(outlineData, parentId) {
  const breadcrumbs = [];
  if (outlineData && parentId) {
    for (let i = outlineData.length - 1; i >= 0; i--) {
      if (outlineData[i].PageID === parentId) {
        breadcrumbs.push(outlineData[i]);
        parentId = outlineData[i].ParentID;
      }
    }
  }
  return breadcrumbs.reverse();
}
