import {Button, Col, Row} from "react-bootstrap";
import {useFormData} from "./FormEditor";

export default function EditorButtons({onUpdate, onDelete, isDataValid, extraButtons, size = 'sm'}) {

  const formData = useFormData();

  return (<>
    <Row className={'mt-4'}>
      <Col xs={'auto'} className={'pe-0'}>
        {onUpdate && isDataValid && (
          <Button
            className="me-2"
            size={size}
            variant="primary"
            onClick={() => {
              formData.update(formData.edits);
              onUpdate?.(formData.edits);
            }}
            disabled={!isDataValid(formData.edits) || !formData.isDataChanged()}
          >
            Update
          </Button>
        )}
        <Button
          size={size}
          variant="secondary"
          onClick={() => formData.revert()}
          disabled={!formData.isDataChanged()}
        >
          Revert
        </Button>
      </Col>
      <Col style={{textAlign: 'end'}} className={'ps-0'}>
        {extraButtons}
        {onDelete && (
          <Button
            size={size}
            variant="danger"
            onClick={()=>onDelete(formData.edits)}
          >
            Delete
          </Button>
        )}
      </Col>
    </Row>
  </>);
}