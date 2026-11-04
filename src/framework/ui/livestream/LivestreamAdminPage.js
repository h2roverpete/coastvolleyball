import {useLocation} from "react-router";
import {lazy, Suspense, useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {Resource, Permission} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import RestrictedContent from "../../auth/RestrictedContent";

const LivestreamPanel = lazy(() => import("./LivestreamPanel"));
const LivestreamList = lazy(() => import("./LivestreamList"));

export default function LivestreamAdminPage() {

  const location = useLocation();
  const {siteData} = useSiteContext();
  const {hasPermission} = useAuth();

  const [livestreamId, setLivestreamId] = useState(null);
  const canView = hasPermission(Resource.LIVESTREAM, Permission.BROADCAST);

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('livestreamId')) {
      setLivestreamId(parseInt(params.get('livestreamId')));
    } else {
      setLivestreamId(0);
    }
  }, [location, setLivestreamId]);

  return <>{canView ? <div className={'PageSection'}>
      <h1>Manage Livestream{!livestreamId && 's'}</h1>
      {livestreamId > 0 ?
        <Suspense><LivestreamPanel livestreamId={livestreamId}/></Suspense>
        : <>{livestreamId === 0 &&
          <Suspense><LivestreamList siteId={siteData?.SiteID}/></Suspense>
        }</>
      }
    </div>
    :
    <RestrictedContent/>
  }</>;
}