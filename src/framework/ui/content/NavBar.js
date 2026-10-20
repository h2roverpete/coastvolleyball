import {useEffect, useRef, useState} from "react";
import {useSiteContext} from "./Site";
import Navbar from 'react-bootstrap/Navbar';
import {Nav, NavDropdown} from "react-bootstrap";
import {useNavigate} from "react-router";
import {useAuth} from "../../auth/AuthProvider";
import {useRestApi} from "../../api/RestApi";
import React from 'react';
import {useTouchContext} from "../../util/TouchProvider";
import AddPageButton from "../editor/AddPageButton";
import {Resource, Permission} from "../../auth/Permissions";
import UserMenu from "./UserMenu";
import Collapse from 'bootstrap/js/dist/collapse';
import './NavBar.css';

/**
 * @typedef NavBarProps
 *
 * @property {String} [brand]           Explicit brand name.
 * @property {String} [brandClassName]  CSS class to apply to brand/logo component
 * @property {string} [icon]            Logo icon for branding. When provided, default brand text is blank.
 * @property {string} [expand]          Bootstrap width boundary to expand/collapse the nav bar, use empty string to prevent collapsing.
 * @property {string} [fixed]           Fix the navbar to a viewport location, i.e. 'top', 'bottom'
 * @property {boolean} [showLogin]      Show a top level element for logging in?
 */

/**
 * Boostrap navbar for site navigation.
 *
 * @param props{NavBarProps}
 * @returns {JSX.Element}
 * @constructor
 */
export default function NavBar(props) {

  // imports
  const {siteData, getChildren, Outline, currentPage, breadcrumbs} = useSiteContext();
  const navigate = useNavigate();
  const {hasPermission, isAuthenticated} = useAuth();
  const {Pages} = useRestApi();
  const {supportsHover} = useTouchContext();

  // states
  const [canEdit, setCanEdit] = useState(false);

  // refs
  const editButtonRef = useRef(null);
  const toggleRef = useRef(null);
  const collapseRef = useRef(null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.SITE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  function navigateTo(to) {
    if ((toggleRef.current.style.visible || toggleRef.current.style.display !== 'none') && !toggleRef.current.classList.contains("collapsed")) {
      // toggle is active, collapse menu on navigation
      toggleRef.current.click();
    }
    // react-router navigation
    navigate(to);
  }

  function isInCurrentPath(pageId) {
    if (currentPage && currentPage.PageID === pageId) {
      // is current page
      return true;
    } else {
      // is in breadcrumb path
      return breadcrumbs?.find((item) => item.PageID === pageId);
    }
  }

  function RecursiveDropdown(props) {
    const children = getChildren(props.pageData.PageID);
    return (
      <>{children.length === 0 ? (
        // no children to render
        <NavDropdown.Item
          draggable={canEdit}
          onMouseMove={(e) => mouseMoveHandler(e)}
          onDragStart={(e) => dragStartHandler(e, props.pageData)}
          onDragOver={(e) => dragOverHandler(e, props.pageData, 'vertical')}
          onDragLeave={(e) => dragLeaveHandler(e)}
          onDrop={(e) => dropHandler(e, props.pageData, 'vertical')}
          key={props.pageData.PageID}
          onClick={() => navigateTo(props.pageData.PageRoute)}
          className={`NavbarDropdownItem text-nowrap${isInCurrentPath(props.pageData.PageID) ? ' active' : ''}`}
          data-testid={`NavItem-${props.pageData.PageID}`}
        >
          {props.pageData.NavTitle ? props.pageData.NavTitle : props.pageData.PageTitle}
        </NavDropdown.Item>
      ) : (
        // at least one child, render a dropdown
        <NavDropdown
          className="NavbarDropdown"
          draggable={canEdit}
          onMouseMove={(e) => mouseMoveHandler(e)}
          onDragStart={(e) => dragStartHandler(e, props.pageData)}
          onDragOver={(e) => dragOverHandler(e, props.pageData, 'horizontal')}
          onDragLeave={(e) => dragLeaveHandler(e)}
          onDrop={(e) => dropHandler(e, props.pageData, 'horizontal')}
          key={props.pageData.PageID}
          title={props.pageData.NavTitle ? props.pageData.NavTitle : props.pageData.PageTitle}
          id={`nav-dropdown${isInCurrentPath(props.pageData.PageID) ? '-active' : ''}`}
          data-testid={`NavItem-${props.pageData.PageID}`}
        >
          <>{children.map((item) => (
            <React.Fragment key={item.PageID}>{getChildren(item.PageID).length > 0 ? (
              // render further dropdown levels
              <RecursiveDropdown pageData={item}/>
            ) : (
              // render this dropdown level
              <NavDropdown.Item
                draggable={canEdit}
                onMouseMove={(e) => mouseMoveHandler(e)}
                onDragStart={(e) => dragStartHandler(e, item)}
                onDragOver={(e) => dragOverHandler(e, item, 'vertical')}
                onDragLeave={(e) => dragLeaveHandler(e)}
                onDrop={(e) => dropHandler(e, item, 'vertical')}
                className={`NavbarDropdownItem text-nowrap${currentPage?.PageID === item.PageID ? ' active' : ''}`}
                key={item.PageID}
                onClick={() => navigateTo(item.PageRoute)}
                data-testid={`NavItem-${item.PageID}`}
              >
                {item.NavTitle ? item.NavTitle : item.PageTitle}
              </NavDropdown.Item>
            )}</React.Fragment>
          ))}</>
        </NavDropdown>
      )}</>
    );
  }

  function mouseMoveHandler(e) {
    if (canEdit) {
      const percent = getCursorPercent(e, 'horizontal')
      e.target.style.cursor = percent < 0.25 ? 'move' : 'pointer';
    }
  }

  function dragStartHandler(e, data) {
    if (canEdit) {
      if (!e.dataTransfer.getData('application/json')) {
        e.target.style.cursor = 'move';
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.stopPropagation()
      }
    }
  }

  function getCursorPercent(e, direction) {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const width = e.nativeEvent.target.offsetWidth;
    const height = e.nativeEvent.target.offsetHeight;
    return direction === 'vertical' ? y / height : x / width;
  }

  function dragOverHandler(e, dropData, direction) {
    if (toggleRef.current?.checkVisibility()) {
      // navbar is collapsed, all items are vertical
      direction = 'vertical';
    }
    const percent = getCursorPercent(e, direction);
    if (canEdit) {
      if (direction === 'vertical') {
        e.target.style.borderStyle = 'solid';
        if (percent < 0.40) {
          e.target.style.borderWidth = '2px 0 0 0';
        } else if (percent < 0.60) {
          e.target.style.borderWidth = '0 2px 0 0';
        } else {
          e.target.style.borderWidth = '0 0 2px 0';

        }
      } else if (direction === 'horizontal') {
        e.target.style.borderStyle = 'solid';
        if (percent < 0.40) {
          e.target.style.borderWidth = '0 0 0 2px';
        } else if (percent < 0.60) {
          e.target.style.borderWidth = '0 0 2px 0';
        } else {
          e.target.style.borderWidth = '0 2px 0 0';
        }
      }
      e.preventDefault();
    }
  }

  function dragLeaveHandler(e) {
    e.target.style.borderWidth = '0 0 0 0';
  }

  /**
   * Process a drop event to reorder navigation.
   *
   * @param e                   Drag Event
   * @param dropData {PageData} Data about the page being dropped on.
   * @param direction {String}  Direction of elements: 'vertical' or 'horizontal'
   */
  function dropHandler(e, dropData, direction) {
    if (canEdit) {
      if (toggleRef.current?.checkVisibility()) {
        // navbar is collapsed, all items are vertical
        direction = 'vertical';
      }
      e.target.style.borderStyle = 'none';
      e.target.style.borderWidth = '0 0 0 0';
      const percent = getCursorPercent(e, direction);
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (dragData.PageID === dropData.PageID) {
        // dropped on same item
        return;
      }
      if (percent < 0.40) {
        console.debug(`Move page '${dragData.PageTitle}' before page '${dropData.PageTitle}'`);
        // move outline first for UI responsiveness
        Outline.movePageBefore(dragData, dropData);
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
        Outline.makeChildOf(dragData, dropData);
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
        Outline.movePageAfter(dragData, dropData);
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
  }

  function handleUserMenuClose() {
    if (collapseRef.current?.classList.contains('show')) {
      // javascript to collapse the navigation bar when a user menu item is selected
      const bsCollapse = new Collapse(collapseRef.current, {toggle: false});
      bsCollapse.toggle();
    }
  }

  return (
    <Navbar
      expand={props.expand ? props.expand : 'sm'}
      className={`NavBar ${!props.expand ? 'navbar-expand' : ''} bg-primary`}
      fixed={props.fixed ? props.fixed : undefined}
      data-testid="NavBar"
      variant={siteData?.SiteTheme}
    >
      <div
        className="NavBarContents container-fluid"
        data-testid="NavBarContents"
      >
        <>{(props.brand || props.icon) && (
          <Navbar.Brand
            style={{cursor: 'pointer'}}
            className={`NavBarBrand ${props.brandClassName}`}
            data-testid="NavBarBrand"
          >
            <>{props.icon && (<>
              {
                typeof props.icon === 'string' ? (
                  <img
                    className="NavBarBrandIcon"
                    src={props.icon}
                    alt={props.brand?.length ? props.brand : siteData?.SiteName}
                    onClick={() => {
                      navigateTo('/')
                    }}
                    data-testid="NavBarBrandIcon"
                  />
                ) : (<div
                  className={`NavBarBrandIcon`}
                  onClick={() => {
                    navigateTo('/')
                  }}
                >
                  {props.icon}
                </div>)
              }
            </>)}</>
            <>{props.brand?.length > 0 && (
              <div
                className={'NavBarBrandText text-nowrap'}
                onClick={() => {
                  navigateTo('/')
                }}
                data-testid="NavBarBrandText"
              >
                {props.brand}
              </div>
            )}</>
          </Navbar.Brand>
        )}</>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          id="NavbarToggle"
          className="NavbarToggle"
          ref={toggleRef}
        />
        <Navbar.Collapse
          className="NavbarCollapse"
          id="MainNavigation"
          style={{position: 'relative'}}
          ref={collapseRef}
          onMouseOver={() => {
            if (canEdit && supportsHover && editButtonRef.current) editButtonRef.current.hidden = false
          }}
          onMouseLeave={() => {
            if (canEdit && supportsHover && editButtonRef.current) editButtonRef.current.hidden = true
          }}
        >
          <Nav
            style={{position: 'relative'}}
          >
            {getChildren(0).map((item) => (
              <React.Fragment
                key={item.PageID}
              >
                {getChildren(item.PageID).length > 0 ? (
                  <RecursiveDropdown pageData={item}/>
                ) : (
                  <Nav.Link
                    draggable={canEdit}
                    style={{cursor: canEdit ? 'move' : 'pointer'}}
                    onMouseMove={(e) => mouseMoveHandler(e)}
                    onDragStart={(e) => dragStartHandler(e, item)}
                    onDragOver={(e) => dragOverHandler(e, item, 'horizontal')}
                    onDragLeave={(e) => dragLeaveHandler(e)}
                    onDrop={(e) => dropHandler(e, item, 'horizontal')}
                    onClick={() => navigateTo(item.PageRoute)}
                    className={`NavLink text-nowrap${isInCurrentPath(item.PageID) ? ' active' : ''}`}
                    key={item.PageID}
                    data-testid={`NavItem-${item.PageID}`}
                  >
                    {item.NavTitle ? item.NavTitle : item.PageTitle}
                  </Nav.Link>
                )}
              </React.Fragment>
            ))}
            {canEdit && (
              <AddPageButton ref={editButtonRef}/>
            )}
          </Nav>
          <>{(props.showLogin === true || isAuthenticated) && (
            <div
              className={`UserMenuContainer flex-grow-1 d-flex justify-content-start justify-content-${props.expand}-end`}>
              <UserMenu onClose={handleUserMenuClose}/>
            </div>
          )}</>
        </Navbar.Collapse>
      </div>
    </Navbar>
  )
}
