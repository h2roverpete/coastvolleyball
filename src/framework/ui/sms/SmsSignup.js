import FormEditor from "../editor/FormEditor";
import SmsSignupFields from "./SmsSignupFields";
import EditorPanel from "../editor/EditorPanel";
import SmsCampaignConfig from "./SmsCampaignConfig";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {useAuth} from "../../auth/AuthProvider";
import {Resource, Permission} from "../../auth/Permissions";

/**
 * Display UI for SMS Campaign, add a user's mobile number or email.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsSignup({smsCampaignId, menuItems}) {

  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();

  const [campaignData, setCampaignData] = useState(/** @type {SMSCampaignData}*/null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission(Resource.SMS, Permission.ADMIN));
  }, []);
  useEffect(() => {
    if (!campaignData) {
      if (smsCampaignId) {
        SMS.getSmsCampaign(smsCampaignId).then((data) => {
          setCampaignData(data);
        }).catch((err) => showErrorAlert(err));
      } else if (campaignData) {
        setCampaignData(campaignData);
      }
    }
  }, [campaignData, smsCampaignId, SMS, showErrorAlert]);

  function handleUpdate(data) {
    setCampaignData(data);
  }

  return <FormEditor>
    <SmsSignupFields campaign={campaignData}/>
    {canEdit &&
      <EditorPanel menuItems={menuItems}>
        <h5>Messaging Campaign Configuration</h5>
        <SmsCampaignConfig campaign={campaignData} onUpdate={handleUpdate}/>
      </EditorPanel>
    }
  </FormEditor>
}