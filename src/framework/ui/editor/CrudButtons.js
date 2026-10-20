import {Button, Col, Row} from "react-bootstrap";
import {useFormData} from "./FormEditor";

/**
 * Standard action buttons for data edit panels & dialogs.
 * @template T
 *
 * @param data {T}                            Data being edited.
 * @param keyName {string}                    Primary key name in data, used to detect insert (no primary key) vs update (primary key exists).
 * @param type {string}                       User readable type for data, added to button names.
 * @param onUpdate {function(T)}              Update button was pressed. (Update button hidden if this prop is missing.)
 * @param onCancel {function()}               Cancel button was pressed.
 * @param onDelete {function(T)}              Delete button was pressed. (Delete button hidden if this prop is missing.)
 * @param isDataValid{function(T):boolean}    Callback to check if form data is valid.
 * @param extraButtons {JSX.Element}          Extra buttons to add to UI.
 *
 * @returns {JSX.Element} Returns a Bootstrap <Row> containing the button UI.
 * @constructor
 */
export default function CrudButtons({data, keyName, type, onUpdate, onCancel, onDelete, isDataValid, extraButtons}) {

  const formData = useFormData();

  return (<Row className={'mt-4'}>
    <Col xs={'auto'} className={'pe-0'}>
      {onUpdate && isDataValid && (
        <Button
          className="me-2"
          size={'sm'}
          variant="primary"
          onClick={() => {
            onUpdate?.(formData.edits);
          }}
          disabled={!isDataValid(formData.edits) || !formData.isDataChanged()}
        >
          {data?.[keyName] ? `Update ` : `Add `}<span className={`d-none d-sm-inline`}>{type}</span>
        </Button>
      )}
      <Button
        size={'sm'}
        variant="secondary"
        onClick={() => formData.revert()}
        disabled={!formData?.isDataChanged()}
      >
        Revert
      </Button>
    </Col>
    <Col style={{textAlign: 'end'}} className={'ps-0'}>
      {extraButtons}
      {onCancel && (
        <Button
          className="me-2"
          size={'sm'}
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
      {onDelete && data?.[keyName] && (
        <Button
          size={'sm'}
          variant="danger"
          onClick={() => onDelete(formData.edits)}
        >
          Delete <span className={`d-none d-sm-inline`}>{type}</span>
        </Button>
      )}
    </Col>
  </Row>);
}