import {useEffect, useState} from "react";
import {Permission, Resource} from "./Permissions";
import {useAuth} from "./AuthProvider";
import RestrictedContent from "./RestrictedContent";
import UserList from "./UserList";
import {useSiteContext} from "../ui/content/Site";

export default function SiteUsers() {

  const {hasPermission} = useAuth();
  const {siteData} = useSiteContext();
  const [canView, setCanView] = useState(true);

  useEffect(() => {
    setCanView(hasPermission(Resource.SITE, Permission.ADMIN));
  }, [hasPermission, setCanView]);

  return (<>
    {canView ? (
      <div className="PageSection">
        <UserList siteId={siteData?.SiteID}/>
      </div>
    ) : (
      <RestrictedContent/>
    )}
  </>);
}