import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../../editor/FormEditor";
import {useEffect} from "react";
import {isValidYouTubeUrl} from "../../../util/Validators";

export default function YouTubeExtraFields() {

  const formData = useFormData();
  useEffect(() => {
    // set default values for display
    if (formData && !formData.edits.AspectRatio) {
      formData.onDataChanged({name: 'AspectRatio', value: '16 / 9'})
    }
    if (formData && !formData.edits.DisplayWidth) {
      formData.onDataChanged({name: 'DisplayWidth', value: 6})
    }
  },[formData]);

  return (<>
    <Row>
      <Col sm={12}>
        <Form.Label
          className='required'
          column={'sm'}
          size={'sm'}
          htmlFor={'YouTubeVideoUrl'}
        >
          YouTube URL
        </Form.Label>
        <Form.Control
          id="YouTubeVideoUrl"
          name="YouTubeVideoUrl"
          size="sm"
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          isValid={formData.edits.YouTubeVideoUrl && isValidYouTubeUrl(formData.edits.YouTubeVideoUrl)}
          isInvalid={formData.edits.YouTubeVideoUrl && !isValidYouTubeUrl(formData.edits.YouTubeVideoUrl)}
          onChange={(e) => formData.onDataChanged({name: 'YouTubeVideoUrl', value: e.target.value})}
          value={formData.edits.YouTubeVideoUrl || ''}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={"DisplayWidth"}
          column={'sm'}
        >
          Display Width
        </Form.Label>
        <Form.Control
          type={'number'}
          id={'DisplayWidth'}
          value={formData.edits.DisplayWidth || 6}
          size={"sm"}
          min={1}
          max={12}
          onChange={(e) => formData.onDataChanged({name: 'DisplayWidth', value: parseInt(e.target.value)})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={"AspectRatio"}
          column={'sm'}
        >
          Aspect Ratio
        </Form.Label>
        <Form.Select
          id={'AspectRatio'}
          value={formData.edits?.AspectRatio || '16 / 9'}
          size={"sm"}
          onChange={(e) => formData.onDataChanged({name: 'AspectRatio', value: e.target.value})}
        >
          <option value="16 / 9">16:9</option>
          <option value="4 / 3">4:3</option>
          <option value="1 / 1">square</option>
        </Form.Select>
      </Col>
    </Row>
  </>);
}