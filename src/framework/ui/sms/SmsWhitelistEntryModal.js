import {Container, Modal, ModalBody} from "react-bootstrap";
import SmsWhitelistEntryFields from "./SmsWhitelistEntryFields";

/**
 * Display a modal dialog with whitelist entry data.
 *
 * @param {SMSWhitelistEntry} subscriber
 * @param {Boolean} show
 * @param {function()} onHide
 * @param {function({SMSWhitelistEntry})} onUpdate
 * @param {function({SMSWhitelistEntry})} onAdd
 * @param {function({SMSWhitelistEntry})} onDelete
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsWhitelistEntryModal({entry, show, onHide, onUpdate, onAdd, onDelete}) {
  return <>
    <Modal show={show} onHide={onHide} className={'Editor'}>
      <ModalBody>
        <Container fluid className="p-0 m-0">
          <h5>Whitelist Entry</h5>
          <SmsWhitelistEntryFields
            entry={entry}
            onUpdate={onUpdate}
            onAdd={onAdd}
            onDelete={onDelete}
            onCancel={onHide}
          />
        </Container>
      </ModalBody>
    </Modal>
  </>
}