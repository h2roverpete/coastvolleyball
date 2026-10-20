import {useEffect, useState} from "react";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import {usePageContext} from "./Page";
import RestrictedContent from "../../auth/RestrictedContent";
import './PageContent.css';

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

  const [canView, setCanView] = useState(true);
  useEffect(() => {
    setCanView(!pageData?.RequiresLogin || hasPermission(Resource.PAGE, Permission.BROWSE_PROTECTED));
  }, [pageData, hasPermission, setCanView]);

  return (<>
    {canView ? (
      <div className="PageContent container-fluid" data-testid="PageContent">
        {children}
      </div>
    ) : (
      <RestrictedContent/>
    )}
  </>);
}