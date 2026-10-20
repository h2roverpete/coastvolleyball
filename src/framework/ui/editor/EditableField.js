import {useCallback, useEffect, useState} from "react";
import EditButtons, {EditAction} from "./EditButtons";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "react-bootstrap";
import AlignButtons, {AlignAction} from "./AlignButtons";
import {useTouchContext} from "../../util/TouchProvider";

/**
 * @type EditableAPI
 *
 * @property {boolean} isEditing
 * @property {function()} startEditing
 */

/**
 * @typedef EditCallbackData
 * @property {string} textContent
 * @property {string} textAlign
 */

/**
 * @callback EditCallback
 * @param {EditCallbackData|undefined}
 */

/**
 * Make an HTML element (h1, h2, div, etc.) editable.
 *
 * @property {JSX.Element} field            JSX element that contains the editable item.
 * @property {Ref<HTMLElement>} fieldRef    Reference to the editable HTML element within the JSX.
 * @property {EditCallback} callback        Called when text edits need to be committed.
 * @property {function()} onCancel          Called when editing is canceled.
 * @property {boolean} [allowEnterKey]      Allow user to press enter key while editing (instead of committing changes)
 * @property {boolean} [showEditButton]     Show edit button? (If false, parent needs to call startEditing() in API)
 * @property {string} [editTooltip]         Tooltip text for the edit button
 * @property {boolean} [alwaysShow]         Always show the field, even if empty (reserves layout space)
 * @property {function(EditableAPI)} [api]  Function to receive editable API.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditableField(
  {
    field,
    fieldRef,
    callback,
    onCancel,
    allowEnterKey,
    showEditButton,
    editTooltip,
    alwaysShow,
    api,
    canEdit = false,
  }
) {

  // imports
  const {supportsHover} = useTouchContext();

  // states
  const [originalContent, setOriginalContent] = useState(null);
  const [originalAlign, setOriginalAlign] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [savedPadding, setSavedPadding] = useState('0');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hideEditButtons, setHideEditButtons] = useState(supportsHover);

  const isChanged = useCallback(() => {
    return fieldRef.current.innerHTML !== originalContent || fieldRef.current.style.textAlign !== originalAlign;
  }, [fieldRef, originalContent, originalAlign]);

  const startEditing = useCallback(() => {

    // snapshot the original content and alignment
    setOriginalContent(fieldRef.current.innerHTML);
    setOriginalAlign(fieldRef.current.style.textAlign);

    // enable pointer events if they were disabled for drag and drop
    fieldRef.current.style.pointerEvents = 'auto';
    fieldRef.current.style.whiteSpace = 'pre-wrap';
    setSavedPadding(fieldRef.current.style.padding);
    fieldRef.current.style.padding = '2px';

    // transform text from display HTML to source
    fieldRef.current.innerText = fieldRef.current.innerHTML

    // set editing flag
    setEditing(true)

    // defer focus until field is visible
    setTimeout(() => fieldRef.current.focus(), 10);
  }, [fieldRef]);

  useEffect(() => {
    if (api) {
      // return editable API
      api({
        isEditing: isEditing,
        startEditing: startEditing,
      })
    }
  }, [api, setEditing, isEditing, startEditing])


  const cancelEditing = useCallback(() => {

    // prevent field from blocking pointer events
    fieldRef.current.style.pointerEvents = 'none';
    fieldRef.current.style.whiteSpace = 'normal';
    fieldRef.current.style.padding = savedPadding;

    // revert content value and alignment
    fieldRef.current.innerHTML = originalContent;
    fieldRef.current.style.textAlign = originalAlign;

    // hide confirmation if visible
    if (showConfirmation) {
      setShowConfirmation(false);
    }

    // clear editing flag
    setEditing(false);

    // fire callback
    onCancel?.();
  }, [fieldRef, onCancel, setEditing, savedPadding, originalAlign, originalContent, showConfirmation]);

  const commitEdits = useCallback(() => {
    console.debug(`Committing edits...`);
    callback({
      textContent: fieldRef.current.innerText.trimEnd(),
      textAlign: fieldRef.current.style.textAlign,
    });

    // transform text from HTML source to display HTML
    fieldRef.current.innerHTML = fieldRef.current.innerText;
    fieldRef.current.style.pointerEvents = 'none';
    fieldRef.current.style.whiteSpace = 'normal';
    fieldRef.current.style.padding = savedPadding;
    setShowConfirmation(false);
    setEditing(false);
  }, [fieldRef, setEditing, setShowConfirmation, savedPadding, callback]);

  /**
   * Handle keyboard events during editing.
   *
   * @type {function(KeyboardEvent): void}
   */
  const onKeyDown = useCallback((evt) => {
    // end editing and update on enter
    if (evt.key === 'Enter' && !allowEnterKey) {
      evt.preventDefault();
      commitEdits();
    }
    if (evt.key === 'Escape') {
      evt.preventDefault();
      cancelEditing();
    }
    if (evt.key === 'Tab') {
      if (isChanged()) {
        // tab out after content has changed
        evt.preventDefault();
        // confirm changes
        setShowConfirmation(true);
      } else {
        // no change to content, just cancel
        cancelEditing();
      }
    }
  }, [allowEnterKey, cancelEditing, commitEdits, isChanged]);

  /**
   * Receive callbacks from edit and alignment buttons.
   *
   * @param action {String} The requested action.
   */
  function editCallback(action) {
    switch (action) {
      case EditAction.EDIT:
        startEditing();
        break;
      case EditAction.CONFIRM:
        commitEdits();
        break;
      case EditAction.CANCEL:
        cancelEditing();
        break;
      case AlignAction.ALIGN_LEFT:
        fieldRef.current.style.textAlign = 'left';
        break;
      case AlignAction.ALIGN_CENTER:
        fieldRef.current.style.textAlign = 'center';
        break;
      case AlignAction.ALIGN_RIGHT:
        fieldRef.current.style.textAlign = 'right';
        break;
      default:
        break;
    }
  }

  function onHideConfirmation() {
    // canceled by clicking outside
    cancelEditing();
  }

  useEffect(() => {
    // update field properties
    fieldRef.current.style.paddingRight = `${isEditing ? '65px' : '0'}`
    fieldRef.current.contentEditable = isEditing === true;
    if (!isEditing) {
      // undo edit modifications to field
      fieldRef.current.classList.remove('border');
      fieldRef.current.classList.remove('rounded-2');
      fieldRef.current.classList.remove('border-secondary');
      fieldRef.current.onkeydown = undefined;
      if (!fieldRef.current.innerText) {
        fieldRef.current.style.minHeight = '39px';
      } else {
        delete fieldRef.current.style.minHeight;
      }
      fieldRef.current.style.pointerEvents = 'none';
      if (!alwaysShow && !fieldRef.current.innerText) {
        fieldRef.current.hidden = true;
      }
    } else {
      // show border around editable item while editing
      fieldRef.current.classList.add('border');
      fieldRef.current.classList.add('rounded-2');
      fieldRef.current.classList.add('border-secondary');
      fieldRef.current.onkeydown = (evt) => onKeyDown(evt);
      fieldRef.current.style.minHeight = '39px';
      fieldRef.current.style.verticalAlign = 'middle';
      fieldRef.current.style.pointerEvents = 'auto';
      fieldRef.current.hidden = false;
    }
  }, [isEditing, fieldRef, alwaysShow, onKeyDown]);

  return (
    <>{canEdit ? (
      <>
        <div
          style={{
            position: 'relative',
            width: '100%',
            pointerEvents: isEditing || showEditButton ? 'auto' : 'none',
          }}
          onMouseOver={() => {
            // always reveal edit buttons
            if (supportsHover) setHideEditButtons(false);
          }}
          onMouseLeave={() => {
            // hide if we aren't editing
            if (supportsHover) setHideEditButtons(!isEditing);
          }}
        >
          {field}
          <AlignButtons
            callback={editCallback}
            editing={isEditing}
            align={fieldRef.current?.style.textAlign}
          />
          <EditButtons
            callback={editCallback}
            editing={isEditing}
            showEditButton={showEditButton}
            tooltip={editTooltip}
            hidden={!isEditing && supportsHover && hideEditButtons}
          />
        </div>
        <Modal
          show={showConfirmation}
          onHide={onHideConfirmation}
          className={'Editor'}
        >
          <ModalHeader>
            <h5>Leaving Edit Mode</h5>
          </ModalHeader>
          <ModalBody>Do you want to save your changes?</ModalBody>
          <ModalFooter>
            <Button size={'sm'} variant="secondary" onClick={() => cancelEditing()}>Cancel</Button>
            <Button size={'sm'} variant="primary" onClick={() => commitEdits()}>Save</Button>
          </ModalFooter>
        </Modal>
      </>
    ) : (
      <>{(fieldRef.current?.textContent.length > 0 || alwaysShow) && (
        <>{field}</>
      )}</>
    )}
    </>
  );
}