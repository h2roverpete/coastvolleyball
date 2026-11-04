import {useLocation} from "react-router";
import {lazy, Suspense, useEffect, useMemo, useState} from "react";
import {useSiteContext} from "../content/Site";
import {Resource, Permission} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import RestrictedContent from "../../auth/RestrictedContent";

const GuestManagement = lazy(() => import("./GuestManagement"));
const GuestBookList = lazy(() => import("./GuestBookList"));

export default function GuestBookAdminPage() {

  const location = useLocation();
  const {siteData} = useSiteContext();
  const {hasPermission} = useAuth();

  const canView = useMemo(() => hasPermission(Resource.GUESTBOOK, Permission.ADMIN), []);
  const guestBookId = useMemo(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('guestBookId')) {
      return parseInt(params.get('guestBookId'));
    } else {
      return 0;
    }
  }, [location]);

  return <>{canView ?
    <div className={'PageSection'}>
      <h1>Manage Guest Book{!guestBookId && 's'}</h1>
      {guestBookId ?
        <Suspense><GuestManagement guestBookId={guestBookId}/></Suspense>
        :
        <Suspense><GuestBookList siteId={siteData?.SiteID}/></Suspense>
      }
    </div>
    :
    <RestrictedContent/>
  }</>;
}