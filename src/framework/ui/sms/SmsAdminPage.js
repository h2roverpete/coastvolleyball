import {useLocation} from "react-router";
import {lazy, Suspense, useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {Resource, Permission} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import SmsCampaignList from "./SmsCampaignList";
import RestrictedContent from "../../auth/RestrictedContent";

const SmsCampaignPanel = lazy(() => import("./SmsCampaignPanel"));

/**
 * Return page content for an SMS admin page.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsAdminPage() {

  const location = useLocation();
  const {siteData} = useSiteContext();
  const {hasPermission} = useAuth();

  const [campaignId, setCampaignId] = useState(0);
  const canView = hasPermission(Resource.SMS, Permission.SEND); // minimum permission for admin panel

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('campaignId')) {
      setCampaignId(parseInt(params.get('campaignId')));
    }
  }, [location, setCampaignId]);

  return <>{canView ? <>
      <h1>Manage Messaging</h1>
      {campaignId ?
        <div className="PageSection">
          <Suspense><SmsCampaignPanel campaignId={campaignId}/></Suspense>
        </div>
        :
        <Suspense><SmsCampaignList siteId={siteData?.SiteID}/></Suspense>
      }
    </>
    :
    <RestrictedContent/>
  }</>;
}