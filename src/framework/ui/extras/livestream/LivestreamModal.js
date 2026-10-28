import {Modal, ModalBody} from "react-bootstrap";
import LivestreamFields from "./LivestreamFields";

/**
 * Modal for editing SMS campaign data.
 *
 * @param {LivestreamData} data
 * @param {function({LivestreamData})} onUpdate
 * @param {function({LivestreamData})} onAdd
 * @param {function({LivestreamData})} onDelete
 * @param {function()} onCancel
 * @returns {JSX.Element}
 * @constructor
 */
export default function LivestreamModal({data, show, onHide, onAdd, onUpdate, onDelete}) {

  return <>
    <Modal show={show} onHide={onHide} className={'Editor'} size="lg">
      <ModalBody className="Editor">
        <h5>Livestream</h5>
        <LivestreamFields data={data} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onCancel={onHide} />
      </ModalBody>
    </Modal>
  </>;
}