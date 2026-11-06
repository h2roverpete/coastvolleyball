import FormEditor from "../editor/FormEditor";
import SmsCampaignFields from "./SmsCampaignFields";

/**
 * Display UI for SMS Campaign, add a user's mobile number
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignConfig(props) {
  return <FormEditor>
    <SmsCampaignFields {...props}/>
  </FormEditor>
}