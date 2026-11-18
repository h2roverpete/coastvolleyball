import FormEditor from "../editor/FormEditor";
import SmsSignupFields from "../sms/SmsSignupFields";
import {Button, Modal, ModalBody} from "react-bootstrap";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

export default function NotificationSignupModal({smsCampaignId, livestreamId}) {

  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  useEffect(() => {
    if (smsCampaignId && campaign?.SMSCampaignID !== smsCampaignId) {
      SMS.getSmsCampaign(smsCampaignId).then((result) => {
        setCampaign(result);
      }).catch((err) => showErrorAlert(err))
    }
  }, [smsCampaignId, campaign, setCampaign, SMS, showErrorAlert]);

  function handleSubmit() {
    setSubmitted(true);
    setShowModal(false);
  }

  return <>
    <div className={'mt-3'}>
      {submitted ?
        <>
        {campaign.CampaignConfirmation}
        </>
        :
        <Button onClick={() => setShowModal(true)}>
          Get Notified
        </Button>
      }
    </div>
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <ModalBody>
        <h5>Get Notified</h5>
        <FormEditor>
          <SmsSignupFields
            campaign={campaign}
            onSubmit={handleSubmit}
            extraData={{LivestreamID: livestreamId}}
            onCancel={() => setShowModal(false)}
          />
        </FormEditor>
      </ModalBody>
    </Modal>
  </>
}