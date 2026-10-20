import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../../editor/FormEditor";
import {isValidInstagramHandle} from "../../../util/Validators";

export default function InstagramExtraFields() {

  const formData = useFormData();

  const labelCols = 4;
  return (<>
    <Row className="mt-2">
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'InstagramHandle'}>Instagram Handle</Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          id={'InstagramHandle'}
          isValid={formData.isTouched('InstagramHandle') && isValidInstagramHandle(formData.edits?.InstagramHandle)}
          isInvalid={formData.isTouched('InstagramHandle') && !isValidInstagramHandle(formData.edits?.InstagramHandle)}
          value={formData.edits?.InstagramHandle || ''}
          defaultValue={'@myhandle'}
          onChange={(e) => formData.onDataChanged({name: 'InstagramHandle', value: e.target.value})}
        />
      </Col>
    </Row>
  </>)
}