import {useEffect, useState} from "react";
import {useSiteContext} from "../../content/Site";
import {useRestApi} from "../../../api/RestApi";
import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../../editor/FormEditor";

export default function LivestreamExtraFields() {

  const {siteData, showErrorAlert} = useSiteContext();
  const {Livestreams} = useRestApi();
  const formData = useFormData();
  
  const [livestreamList, setLivestreamList] = useState([]);

  useEffect(() => {
    if (siteData && !livestreamList.length) {
      // load list of existing livestreams
      Livestreams.getLivestreams().then((result) => {
        const siteLivestreams = [];
        for (const livestream of result) {
          if (!livestream.SiteID || livestream.SiteID === siteData.SiteID) {
            siteLivestreams.push(livestream);
          }
        }
        console.debug(`List of ${siteLivestreams.length} livestreams loaded.`);
        setLivestreamList(siteLivestreams);
      }).catch((err) => {
        showErrorAlert(`Error getting livestream list.`, err);
      })
    }
  }, [siteData, Livestreams, setLivestreamList, showErrorAlert, livestreamList?.length]);

  const labelCols = 4;
  return <>
    <Row className="mt-2">
      <Col sm={labelCols}></Col>
      <Col hidden={livestreamList?.length === 0}>
        <Form.Check
          type='radio'
          name={'NewLivestream'}
          className='form-control-sm'
          label='Create new livestream'
          checked={formData.edits.LivestreamID === undefined}
          onChange={() => {
            formData.onDataChanged({name: 'LivestreamID', value: undefined});
          }}
        />
        <Form.Check
          type='radio'
          name={'NewLivestream'}
          value={'true'}
          className='form-control-sm'
          label='Use existing livestream'
          checked={formData.edits.LivestreamID !== undefined}
          onChange={() => {
            formData.onDataChanged({name: 'LivestreamID', value: 0});
          }}
        />
      </Col>
    </Row>
    {formData.edits.LivestreamID !== undefined ? (
      <Row className="mt-2">
        <Form.Label
          className='required'
          column={'sm'}
          htmlFor={'Livestream'}
          sm={labelCols}
        >Livestream
        </Form.Label>
        <Col>
          <Form.Select
            name={"Livestream"}
            size="sm"
            onChange={(e) => formData.onDataChanged({name: 'LivestreamID', value: parseInt(e.target.value)})}
            value={formData.edits.LivestreamID}
          >
            <option key={''} value={0}>(Select a livestream)</option>
            {livestreamList.map((livestream) => (
              <option key={livestream.LivestreamID} value={livestream.LivestreamID}>{livestream.LivestreamName}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
    ) : (
      <Row className="mt-2">
        <Form.Label className='required' column={'sm'} htmlFor={'LivestreamName'} sm={labelCols}>
          Livestream Name</Form.Label>
        <Col>
          <Form.Control
            name="LivestreamName"
            size="sm"
            isValid={formData.isTouched('LivestreamName') && formData.edits.LivestreamName.length > 0}
            isInvalid={formData.isTouched('LivestreamName') && formData.edits.LivestreamName.length === 0}
            onChange={(e) => formData.onDataChanged({name: 'LivestreamName', value: e.target.value})}
            value={formData.edits.LivestreamName || ''}
          />
        </Col>
      </Row>
    )}
  </>
}