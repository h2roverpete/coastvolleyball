import {useFormData} from "../../editor/FormEditor";
import {useEffect, useState} from "react";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {useRestApi} from "../../../api/RestApi"
import {useSiteContext} from "../../content/Site";
import './LivestreamFields.css'
import CrudButtons from "../../editor/CrudButtons";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function LivestreamFields({data, onAdd, onUpdate, onDelete, onCancel}) {

  const {Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();
  const {Livestreams} = useRestApi();

  const [sites, setSites] = useState();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    if (!sites) {
      Sites.getSites().then((response) => {
        response = response.sort((a, b) => a.SiteName.localeCompare(b.SiteName));
        setSites(response);
      }).catch((error) => showErrorAlert(error));
    }
  }, [sites, Sites, showErrorAlert]);

  useEffect(() => {
    // TODO fix dependency loop here
    if (data && data.SandboxMode === undefined) {
      data.SandboxMode = true;
    }
    formData.update(data);
  }, [data])

  /**
   * Handle validation event from CrudButtons.
   */
  function isDataValid() {
    return formData.edits.LivestreamName?.length > 0
      && formData.edits.SiteID > 0
  }

  /**
   * Handle update event from CrudButtons.
   */
  function handleUpdate() {
    Livestreams.insertOrUpdateLivestream(formData.edits).then((result) => {
      formData.update(result);
      if (data.LivestreamID > 0) {
        onUpdate?.(result);
      } else {
        onAdd?.(result);
      }
    }).catch(error => {
      showErrorAlert(error);
    })
  }

  /**
   * Handle cancel event from CrudButtons.
   */
  function handleCancel() {
    onCancel();
  }

  function confirmDelete() {
    setShowDeleteConfirmation(true);
  }

  /**
   * Handle delete event from CrudButtons.
   */
  function handleDelete() {
    setShowDeleteConfirmation(false);
    Livestreams.deleteLivestream(formData.edits.LivestreamID).then((result) => {
      onDelete(result);
    }).catch(error => {
      showErrorAlert(error);
    });
  }

  const labelCols = 4;
  return <>
    <Row className={'mt-1'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'LivestreamName'}
      >
        Name
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          name={'LivestreamName'}
          isValid={formData.isTouched('LivestreamName') && formData.edits.LivestreamName?.length > 0}
          isInvalid={formData.isTouched('LivestreamName') && !(formData.edits.LivestreamName?.length > 0)}
          value={formData.edits?.LivestreamName || ''}
          onChange={(e) => formData.onDataChanged({name: 'LivestreamName', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Form.Label
        column={'sm'}
        sm={labelCols}
        htmlFor={'SiteID'}
      >
        Site
      </Form.Label>
      <Col>
        <Form.Select
          size={'sm'}
          name={'SiteID'}
          value={formData.edits?.SiteID || 0}
          onChange={(e) => formData.onDataChanged({name: 'SiteID', value: parseInt(e.target.value)})}
        >
          <option value={0}>(select a site)</option>
          {sites?.map((site) =>
            <option key={site.SiteID} value={site.SiteID}>
              {site.SiteName}
            </option>
          )}
        </Form.Select>
      </Col>
    </Row>
    <CrudButtons
      data={formData.edits}
      type="Livestream"
      keyName={'LivestreamID'}
      onUpdate={handleUpdate}
      onCancel={onCancel && handleCancel}
      onDelete={onDelete && confirmDelete}
      isDataValid={isDataValid}
    />
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
      size={'sm'}
    >
      <Modal.Body>
        <h5>Delete Livestream</h5>
        <div>Are you sure you want to delete {data?.LivestreamName}? This action can't be undone.</div>
        <div className='mt-2 d-flex justify-content-end gap-2'>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>
  </>;
}