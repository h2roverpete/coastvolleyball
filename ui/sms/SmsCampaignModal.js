import {Modal, ModalBody} from "react-bootstrap";
import SmsCampaignFields from "./SmsCampaignFields";

/**
 * Modal for editing SMS campaign data.
 *
 * @param {SMSCampaignData} campaign
 * @param {function({SMSCampaignData})} onUpdate
 * @param {function({SMSCampaignData})} onAdd
 * @param {function({SMSCampaignData})} onDelete
 * @param {function()} onCancel
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsCampaignModal({campaign, show, onHide, onAdd, onUpdate, onDelete}) {

  return <>
    <Modal show={show} onHide={onHide} className={'Editor'} size="lg">
      <ModalBody className="Editor">
        <h5>SMS Campaign</h5>
        <SmsCampaignFields campaign={campaign} onAdd={onAdd} onUpdate={onUpdate} onDelete={onDelete} onCancel={onHide} />
      </ModalBody>
    </Modal>
  </>
}