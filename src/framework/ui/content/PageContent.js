import {useEffect, useRef, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {usePageContext} from "./Page";
import RestrictedContent from "../../auth/RestrictedContent";
import './PageContent.css';
import PagePassword from "./PagePassword";

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
  const {pageData} = usePageContext();
  const passwordApi = useRef(null);
  const [canView, setCanView] = useState(false);

  useEffect(() => {
      if (!canView && pageData && hasPermission) {
        if (pageData.RequiresPassword && passwordApi.current) {
          // check if user is logged in with admin permission
          if (hasPermission(Resource.PAGE, Permission.ADMIN)) {
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
    }
    ,
    [pageData, hasPermission, setCanView, canView]
  )
  ;

  return (<>
    {pageData && <>
      {
        canView ?
          <div className="PageContent container-fluid" data-testid="PageContent">
            {children}
          </div>
          :
          pageData?.RequiresPassword ?
            <PagePassword onSuccess={() => setCanView(true)} pageData={pageData} apiRef={passwordApi}/>
            : pageData?.RequiresLogin &&
            <RestrictedContent/>
      }
    </>
    }
  </>);
}