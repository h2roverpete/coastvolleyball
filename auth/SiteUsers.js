import {useEffect, useState} from "react";
import {Permission, Resource} from "./Permissions";
import {useAuth} from "./AuthProvider";
import RestrictedContent from "./RestrictedContent";

export default function SiteUsers() {

  const {hasPermission} = useAuth();
  const [canView, setCanView] = useState(true);

  useEffect(() => {
    setCanView(hasPermission(Resource.SITE, Permission.ADMIN));
  }, [hasPermission, setCanView]);

  return (<>
    {canView ? (
      <div className="PageSection">
        (user list here)
      </div>
    ) : (
      <RestrictedContent/>
    )}
  </>);
}