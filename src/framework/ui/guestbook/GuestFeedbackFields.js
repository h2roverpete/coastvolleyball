import LodgingFields from "./LodgingFields";
import CustomFields from "./CustomFields";
import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor"

/**
 * Fields for entering guest feedback.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param labelCols {Number}
 * @returns {JSX.Element}
 * @constructor
 */
function GuestFeedbackFields({guestBookConfig, labelCols}) {
  const formData = useFormData();
  return (<>
    {guestBookConfig.ShowLodgingFields && (
      <LodgingFields labelCols={labelCols}/>
    )}
    <CustomFields
      guestBookConfig={guestBookConfig}
      labelCols={labelCols}
    />
    {guestBookConfig.ShowFeedback && (
      <Row className={'mt-2'}>
        <Col>
          <Form.Label
            htmlFor="FeedbackText"
            column={true}
          >
            {guestBookConfig.TextCaption ? guestBookConfig.TextCaption : 'Questions or Comments'}
          </Form.Label>
          <Form.Control
            as="textarea"
            name="FeedbackText"
            id="FeedbackText"
            rows={5}
            value={formData.edits.FeedbackText || ''}
            onChange={e => formData.onDataChanged({name: 'FeedbackText', value: e.target.value})}
          />
        </Col>
      </Row>
    )}
  < />)
}

export default GuestFeedbackFields;