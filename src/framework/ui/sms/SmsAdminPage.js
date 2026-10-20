import {useLocation} from "react-router";
import {useEffect, useState} from "react";
import SmsCampaignPanel from "./SmsCampaignPanel";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Resource, Permission} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";

export default function SmsAdminPage() {

  const location = useLocation();
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();

  const [campaignId, setCampaignId] = useState(0);
  const [campaign, setCampaign] = useState(/** @type {SMSCampaignData} */ null);
  const [canView, setCanView] = useState(true);

  useEffect(() => {
    setCanView(hasPermission(Resource.SMS, Permission.SEND)); // minimum permission for admin panel
  }, [hasPermission, setCanView]);

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('campaignId')) {
      setCampaignId(parseInt(params.get('campaignId')));
    }
  }, [location, setCampaignId]);

  useEffect(() => {
    if (campaignId && !campaign) {
      SMS.getSmsCampaign(campaignId).then((data) => {
        setCampaign(data);
      }).catch((err) => {
        showErrorAlert(err);
      })
    }
  }, [campaignId, setCampaign, SMS, showErrorAlert, campaign]);

  return <>{canView ? <>
      <div className="SmsAdmin">
        <SmsCampaignPanel campaignData={campaign}/>
      </div>
    </>
    :
    <></>}</>;
}