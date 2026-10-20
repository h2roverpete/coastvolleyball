import {Col, Row} from "react-bootstrap";
import TextMessagePreview from "./TextMessagePreview";
import EmailPreview from "./EmailPreview";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @param {MMSFileData[]} files
 * @param {function(MMSFileData)} onDeleteFile
 * @constructor
 */
export default function SmsMessagePreview({campaign, message, files, onDeleteFile}) {

  const {Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [imageUrls, setImageUrls] = useState(/** @type String[] */ []);
  const [siteData, setSiteData] = useState(/** @type SiteData */ null);

  useEffect(() => {
    if (Sites && files && !siteData) {
      Sites.getSite(campaign.SiteID).then((site) => {
        setSiteData(site)
      }).catch((err) => showErrorAlert(err));
    }
  }, [files, campaign, Sites, showErrorAlert, siteData])

  useEffect(() => {
    if (files && siteData) {
      setImageUrls(files.map((file) => file.MMSFileMimeType === `image/jpeg` && `${siteData.SiteRootUrl}/${file.MMSFileName}`));
    }
  }, [files, siteData, setImageUrls]);

  function handleDeleteImage(url) {
    for (const file of files) {
      if (url.endsWith(file.MMSFileName)) {
        onDeleteFile(file);
        return;
      }
    }
  }

  return <>{campaign && message && <Row>
    <Col sm={6} className={'mt-3'}>
      <h5>SMS</h5>
      <TextMessagePreview
        text={message.Message + ' Reply STOP to unsubscribe.'}
        campaign={campaign}
        imageUrls={imageUrls}
        onDeleteImage={onDeleteFile && handleDeleteImage}
      />
    </Col>
    <Col sm={6} className={'mt-3 d-flex flex-column'}>
      <h5>Email</h5>
      <EmailPreview
        message={message}
        campaign={campaign}
        imageUrls={imageUrls}
        onDeleteImage={onDeleteFile && handleDeleteImage}
      />
    </Col>
  </Row>}</>;
}