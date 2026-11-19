import {Accordion, Col, Form, Row} from "react-bootstrap";
import CrudButtons from "../editor/CrudButtons";
import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {useFormData} from "../editor/FormEditor";
import {isValidUrl} from "../../util/Validators";
import './LIvestreamSmsFields.css';

export default function LivestreamSmsFields({livestreamData}) {

  const {SMS, Livestreams} = useRestApi();
  const {showErrorAlert, siteData} = useSiteContext();
  const formData = useFormData();

  const [smsCampaigns, setSmsCampaigns] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!smsCampaigns) {
      SMS.getSmsCampaignsForSite(siteData.SiteID).then(result => {
        setSmsCampaigns(result);
      })
    }
  }, [smsCampaigns, setSmsCampaigns, SMS]);

  useEffect(() => {
    formData.setData(livestreamData);
  }, [livestreamData]);

  function isDataValid(data) {
    return data.SMSCampaignID > 0 && isValidUrl(data.ViewingURL);
  }

  function handleUpdate(data) {
    setUpdating(true);
    Livestreams.insertOrUpdateLivestream(data).then(result => {
      formData.update(result);
      setUpdating(false);
    }).catch((err) => showErrorAlert(err));
  }

  return <>
    <Accordion className={'mt-3'}>
      <Accordion.Item eventKey={'1'}>
        <Accordion.Header>Notifications</Accordion.Header>
        <Accordion.Body>
          <Row className={'mt-2'}>
            <Form.Label column={'sm'} htmlFor={'SMSCampaignID'}>Campaign</Form.Label>
            <Col xs={8}>
              <Form.Select
                name={'SMSCampaignID'}
                value={formData?.edits.SMSCampaignID || 0}
                size={'sm'}
                onChange={(e) => formData.onDataChanged({name: 'SMSCampaignID', value: parseInt(e.target.value)})}
              >
                <option value={'0'}>(none)</option>
                {smsCampaigns?.map((campaign) => <option key={campaign.SMSCampaignID}
                                                         value={campaign.SMSCampaignID}>{campaign.CampaignName}</option>)}
              </Form.Select>
            </Col>
            <Col xs={1}></Col>
          </Row>
          <Row className={'mt-2'}>
            <Form.Label column={'sm'} htmlFor={'ViewingURL'}>Viewing URL</Form.Label>
            <Col xs={8}>
              <Form.Control
                name={'ViewingURL'}
                value={formData.edits?.ViewingURL || ''}
                size={'sm'}
                isValid={formData.edits?.ViewingURL && isValidUrl(formData.edits?.ViewingURL)}
                isInvalid={formData.edits?.ViewingURL && !isValidUrl(formData.edits?.ViewingURL)}
                onChange={(e) => formData.onDataChanged({name: 'ViewingURL', value: e.target.value})}
              />
            </Col>
            <Col xs={1}></Col>
          </Row>
          <Row className={'mt-2'}>
            <CrudButtons
              keyName={'LivestreamID'}
              onUpdate={handleUpdate}
              isDataValid={isDataValid}
              updating={updating}
            />
          </Row>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  </>
}