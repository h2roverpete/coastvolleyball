import {Modal, ModalBody} from "react-bootstrap";
import UserFields from "./UserFields";

/**
 * Modal for editing SMS campaign data.
 *
 * @param {NewUserData} data
 * @param {Number} siteId
 * @param {function({NewUserData})} onUpdate
 * @param {function({NewUserData})} onAdd
 * @param {function({NewUserData})} onDelete
 * @param {function()} onCancel
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserModal({data, siteId, show, onHide, onAdd, onUpdate, onDelete}) {

  return <>
    <Modal show={show} onHide={onHide} className={'Editor'} size="lg">
      <ModalBody className="Editor">
        <h5>{data?.UserID ? 'Edit User Properties' : <>Add a {siteId && 'Site'} User</>}</h5>
        <UserFields data={data} siteId={siteId} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onCancel={onHide} />
      </ModalBody>
    </Modal>
  </>;
}