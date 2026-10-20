import {Button, Col, Modal, Spinner} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import PageFields from "./PageFields";
import {useFormData} from "./FormEditor";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {isValidRoute} from "../../util/Validators";
import {BsStars} from "react-icons/bs";

export default function PageConfigModal({pageData, outlineData, show, onHide, onUpdated, onDeleted, onAdded}) {

  const formData = useFormData();
  const {Pages} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const [describing, setDescribing] = useState(false);

  useEffect(() => {
    if (formData.edits.PageID !== pageData?.PageID || formData.edits.SiteID !== pageData?.SiteID) {
      formData.update(pageData);
    }
  }, [formData, pageData]);

  function isDataValid() {
    return formData.edits.SiteID > 0 && formData.edits.PageTitle?.length > 0 && isValidRoute(formData.edits, outlineData);
  }

  function handleUpdate() {
    if (formData.edits.PageID > 0) {
      console.debug(`Update page ${formData.edits.PageID}...`);
      Pages.insertOrUpdatePage(formData.edits)
        .then(result => {
          console.debug(`Updated page ${pageData?.PageID}.`);
          formData.update(result);
          onUpdated?.(result);
        })
        .catch(error => showErrorAlert(error));
    } else {
      console.debug(`Add page...`);
      Pages.insertOrUpdatePage(formData.edits)
        .then(result => {
          console.debug(`Added page ${result.PageID}.`);
          formData.update(result);
          onAdded?.(result);
        })
        .catch(error => showErrorAlert(error));
    }
  }

  function handleDelete() {
    console.debug(`Deleting page ${pageData?.PageID}...`);
    Pages.deletePage(formData.edits.PageID)
      .then(result => {
        console.debug(`Deleted page ${pageData?.PageID}.`);
        onDeleted?.(result);
      })
      .catch(error => showErrorAlert(error));
  }

  const handleDescribe = useCallback(() => {
    console.debug(`Describe page ${formData.edits?.PageID}...`);
    setDescribing(true);
    formData.onDataChanged({
      changes: [
        {name: 'PageMetaTitle', value: ''},
        {name: 'PageMetaDescription', value: ''},
        {name: 'PageMetaKeywords', value: ''},
      ]
    });
    Pages.describePage(formData.edits?.PageID)
      .then(result => {
        console.debug(`Received page ${formData.edits?.PageID} description.`);
        formData.onDataChanged({
          changes: [
            {name: 'PageMetaTitle', value: result.title},
            {name: 'PageMetaDescription', value: result.description},
            {name: 'PageMetaKeywords', value: result.keywords},
          ]
        });
        setDescribing(false);
      })
      .catch(error => {
        showErrorAlert(`Error describing page.`, error);
        setDescribing(false);
      });
  }, [formData, setDescribing, Pages, showErrorAlert]);

  return (
    <Modal show={show}>
      <Modal.Header>
        <h5>Page Properties</h5>
      </Modal.Header>
      <Modal.Body>
        <PageFields outlineData={outlineData}/>
      </Modal.Body>
      <Modal.Footer>
        <Col className={'d-flex flex-row align-items-center'}>
          <Button
            size="sm"
            variant="primary"
            onClick={handleUpdate}
            disabled={!formData.isDataChanged() || !isDataValid()}
            className={'me-2'}
          >
            {formData.edits.PageID > 0 ? <>Update</> : <>Add</>}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => formData.revert()}
            disabled={!formData.isDataChanged()}
            className={'me-2'}
          >
            Revert
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDescribe()}
            hidden={!formData.edits.PageID > 0}
            className={'me-2'}
            style={{minWidth: '100px'}}
          >
            {describing ? <Spinner size="sm"/> : <><BsStars size={'15'} className={'me-1'}/>Describe</>}
          </Button>
        </Col>
        <Col className={'d-flex flex-row align-items-center justify-content-end'}>
          <Button
            size="sm"
            variant="secondary"
            onClick={onHide}
            className={'me-2'}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            hidden={!formData.edits.PageID > 0}
          >
            Delete
          </Button>
        </Col>
      </Modal.Footer>
    </Modal>
  )
}