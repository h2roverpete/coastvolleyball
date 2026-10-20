import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BsPlus} from "react-icons/bs";
import React, {lazy, Suspense, useEffect, useState} from "react";
import FormEditor from "./FormEditor";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {useTouchContext} from "../../util/TouchProvider";
import {useSiteContext} from "../content/Site";

const NewPageModal = lazy(() => import("../editor/NewPageModal"));

/**
 * Dropdown menu for adding a new page or page section.
 *
 * @param {Ref<HTMLButtonElement>} [ref]  Receive a reference to the dropdown button div.
 *
 * @returns {Element}
 * @constructor
 */
export default function AddPageButton({ref}) {

  // imports
  const {hasPermission} = useAuth();
  const {supportsHover} = useTouchContext();
  const {siteData} = useSiteContext();

  // states
  const [showNewPage, setShowNewPage] = useState(false);
  const [canEditSite, setCanEditSite] = useState(false);

  useEffect(() => {
    setCanEditSite(hasPermission?.(Resource.SITE, Permission.EDIT));
  }, [setCanEditSite, hasPermission]);

  return (<>
  {canEditSite && (<>
    <OverlayTrigger
      placement="bottom"
      overlay={<Tooltip>Add a new page</Tooltip>}
      delay={{show: 1000}}
    >
      <Button
        className={`AddPageButton EditButton`}
        variant={siteData?.SiteTheme}
        type="button"
        size={'sm'}
        ref={ref}
        onClick={() => {
          setShowNewPage(true)
        }}
        hidden={supportsHover}
      >
        <BsPlus/>
      </Button>
    </OverlayTrigger>
    {showNewPage && (<Suspense fallback={<></>}>
      <FormEditor>
        <NewPageModal show={showNewPage} setShow={setShowNewPage}/>
      </FormEditor>
    </Suspense>)
    }
  </>)}
  </>)
    ;
}