import {useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {Col, Form, Modal, ModalBody, Row, Button} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import CrudButtons from "../editor/CrudButtons";
import '../editor/Editor.css';
/**
 * Manage gallery data.
 *
 * @param {GalleryData} [data]                  Use the provided data.
 * @param {Number} [galleryId]                  Load data by gallery ID.
 * @param {Number} [siteId]                     Enforce the provided site ID and don't show the list of sites.
 * @param {function()} [onCancel]               If defined, show cancel button and invoke callback when pressed.
 * @param {function({GalleryData})} [onUpdate]  If defined, allow editing and invoke callback when updated.
 * @param {function({GalleryData})} [onDelete]  If defined, allow deletion and invoke callback when deleted.
 * @returns {JSX.Element}
 * @constructor
 */
export default function GalleryFields({data, galleryId, siteId, onCancel, onUpdate, onDelete}) {

  const {Galleries, Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [siteList, setSiteList] = useState(null);

  useEffect(() => {
    if (data) {
      // use provided data
      formData.update({...data, SiteID:data.SiteID ? data.SiteID : siteId});
    } else if (galleryId) {
      // fetch data from REST API
      Galleries.getGallery(galleryId).then((result) => {
        formData.update(result);
      }).catch(error => {
        showErrorAlert(`Error loading gallery ${galleryId}: ${error}`);
      })
    } else {
      // default values
      formData.update({SiteID:siteId});
    }
  }, [galleryId, data, showErrorAlert, Galleries]);

  useEffect(() => {
    if (!siteList) {
      Sites.getSites().then((result) => {
        setSiteList(result);
      }).catch(error => showErrorAlert(`Error loading site list.`, error));
    }
  })

  function isDataValid(data) {
    return data.GalleryName?.length > 0 && data.SiteID
  }

  function handleUpdate(data) {
    Galleries.insertOrUpdateGallery(data).then((result) => {
      formData.update(result);
      onUpdate?.(result);
    }).catch(error => showErrorAlert(error));
  }

  function handleDelete(data) {
    Galleries.deleteGallery(data.GalleryID).then(() => {
      onDelete?.(data);
    }).catch(error => showErrorAlert(error));
  }

  const labelCols = 2;
  return <>
    <Row>
      <Form.Label
        column={'sm'}
        className="required"
        sm={labelCols}
        htmlFor={'GalleryName'}
      >
        Gallery Name
      </Form.Label>
      <Col>
        <Form.Control
          size={'sm'}
          id={'GalleryName'}
          isValid={formData.isTouched('GalleryName') && formData.edits?.GalleryName.length > 0}
          isInvalid={formData.isTouched('GalleryName') && formData.edits?.GalleryName.length === 0}
          value={formData.edits?.GalleryName || ''}
          onChange={(e) => formData.onDataChanged({name: 'GalleryName', value: e.target.value})}
        />
      </Col>
    </Row>
    {!siteId && <Row className="mt-2">
      <Form.Label
        column={'sm'}
        className="required"
        sm={labelCols}
        htmlFor={'GalleryName'}
      >
        Site
      </Form.Label>
      <Col>
        <Form.Select
          size={'sm'}
          id={'SiteID'}
          value={formData.edits?.SiteID || 0}
          onChange={(e) => formData.onDataChanged({name: 'SiteID', value: parseInt(e.target.value)})}
        >
          <option value={0}>(select)</option>
          {siteList?.map(site => <option key={site.SiteID} value={site.SiteID}>{site.SiteName}</option>)})
        </Form.Select>
      </Col>
    </Row>}
    <Row className={'mt-2'}>
      <Col sm={labelCols}></Col>
      <Col>
        <Form.Check
          checked={formData.edits?.RandomizeOrder === true}
          label="Randomize display order"
          onChange={(e) => formData.onDataChanged({name: 'RandomizeOrder', value: e.target.checked})}
        />
      </Col>
    </Row>
    <CrudButtons
      keyName={'GalleryID'}
      type={'Gallery'}
      onCancel={onCancel}
      isDataValid={isDataValid}
      onDelete={() => setShowDeleteConfirmation(true)}
      onUpdate={handleUpdate}
    />
    <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)} size={'sm'}>
      <ModalBody className={'Editor'}>
        <h5>Delete Gallery</h5>
        <p>Are you sure you want to delete the gallery &ldquo;{formData?.edits.GalleryName}?&rdquo; This action cannot
          be undone.</p>
        <div className={'d-flex justify-content-end align-items-center gap-3'}>
          <Button
            size={'sm'}
            variant="secondary"
            onClick={() => setShowDeleteConfirmation(false)}
          >
            Cancel
          </Button>
          <Button
            size={'sm'}
            variant="danger"
            onClick={() => handleDelete(formData?.edits)}
          >
            Delete
          </Button>

        </div>
      </ModalBody>
    </Modal>
  </>;
}