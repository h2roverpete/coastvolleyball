import {lazy, Suspense} from "react";
import {useSiteContext} from "../ui/content/Site";
import {Resource, Permission} from "./Permissions";
import {useAuth} from "./AuthProvider";
import RestrictedContent from "./RestrictedContent";

const UserList = lazy(() => import("./UserList"));

/**
 * Return page content for an SMS admin page.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsAdminPage() {

  const {siteData} = useSiteContext();
  const {hasPermission} = useAuth();

  const canView = hasPermission(Resource.USERS, Permission.ADMIN); // minimum permission for admin panel

  return <>{canView ? <>
      <h1>Manage Users</h1>
      <Suspense><UserList siteId={siteData?.SiteID}/></Suspense>
    </>
    :
    <RestrictedContent/>
  }</>;
}