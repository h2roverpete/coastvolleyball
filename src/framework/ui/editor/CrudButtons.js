import {Button, Col, Row, Spinner} from "react-bootstrap";
import {useFormData} from "./FormEditor";

/**
 * Standard action buttons for data edit panels & dialogs.
 * @template T
 *
 * @param keyName {string}                    Primary key name in data, used to detect insert (no primary key) vs update (primary key exists).
 * @param type {string}                       User readable type for data, added to button names.
 * @param onUpdate {function(T)}              Update button was pressed. (Update button hidden if this prop is missing.)
 * @param updating {Boolean}                  Show a spinner in the update button and disable it
 * @param deleting {Boolean}                  Show a spinner in the delete button and disable it
 * @param onCancel {function()}               Cancel button was pressed.
 * @param onDelete {function(T)}              Delete button was pressed. (Delete button hidden if this prop is missing.)
 * @param isDataValid{function(T):boolean}    Callback to check if form data is valid.
 * @param extraButtons {JSX.Element}          Extra buttons to add to UI.
 * @param [size] {'sm'|'lg'|null}             Button size.
 *
 * @returns {JSX.Element} Returns a Bootstrap <Row> containing the button UI.
 * @constructor
 */
export default function CrudButtons(
  {
    keyName,
    type,
    onUpdate,
    updating,
    onCancel,
    onDelete,
    deleting,
    isDataValid,
    extraButtons,
    size
  }
) {

  const formData = useFormData();

  return (<Row className={'mt-4'}>
    <Col xs={'auto'} className={'pe-0'}>
      {onUpdate && isDataValid && (
        <Button
          className="me-2"
          size={size}
          variant="primary"
          onClick={() => onUpdate(formData.edits)}
          disabled={!isDataValid(formData.edits) || !formData.isDataChanged() || updating || deleting}
        >
          <div style={{display: 'grid', placeItems: 'center'}}>
            <div style={{
              gridArea: '1/1',
              visibility: !updating ? 'visible' : 'hidden'
            }}>{formData?.edits[keyName] ? `Update ` : `Add `} {type}</div>
            <Spinner size="sm" style={{gridArea: '1/1', visibility: updating ? 'visible' : 'hidden'}}/>
          </div>
        </Button>
      )}
      <Button
        size={size}
        variant="secondary"
        onClick={() => formData.revert()}
        disabled={!formData?.isDataChanged() || deleting || updating}
      >
        Revert
      </Button>
    </Col>
    <Col style={{textAlign: 'end'}} className={'ps-0'}>
      {extraButtons}
      {onDelete && formData?.edits[keyName] && (
        <Button
          className="me-2"
          size={size}
          variant="danger"
          onClick={() => onDelete(formData.edits)}
          disabled={deleting||updating}
        >
          <div style={{display: 'grid', placeItems: 'center'}}>
            <div style={{
              gridArea: '1/1',
              visibility: !deleting ? 'visible' : 'hidden'
            }}> Delete {type}</div>
            <Spinner size="sm" style={{gridArea: '1/1', visibility: deleting ? 'visible' : 'hidden'}}/>
          </div>
        </Button>
      )}
      {onCancel && (
        <Button
          className="me-2"
          size={size}
          variant="secondary"
          onClick={onCancel}
          disabled={deleting||updating}
        >
          Cancel
        </Button>
      )}

    </Col>
  </Row>);
}