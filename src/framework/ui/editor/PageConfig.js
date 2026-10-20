import {Button, Col, Form, Modal, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";
import {useFormData} from "./FormEditor";
import {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import {BsStars} from "react-icons/bs";

export default function PageConfig({onPageUpdated, onPageDeleted, modalRef}) {

  const {Pages} = useRestApi();
  const {Outline, outlineData, currentPage} = useSiteContext();
  const {setPageData} = usePageContext();

  /** @type FormDataAPI<PageData> */
  const formData = useFormData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [describing, setDescribing] = useState(false);

  // destructure update function to satisfy eslint
  const {update} = formData;
  useEffect(() => {
    update(currentPage);
  }, [currentPage, update]);

  useEffect(() => {
    if (outlineData && currentPage) {
      const routeList = [];
      for (const page of outlineData) {
        if (page.PageID !== currentPage.PageID) {
          routeList.push(page.PageRoute);
        }
      }
      setRoutes(routeList);
    }
  }, [outlineData, currentPage]);

  function isDataValid() {
    return isValidRoute(formData.edits?.PageRoute)
  }

  function onUpdate() {
    console.debug(`Updating page...`);
    Pages.insertOrUpdatePage(formData.edits).then((result) => {
      console.debug(`Updated page.`);
      formData.update(result)
      Outline.updatePage(result);
      setPageData?.(result);
    }).catch((error) => {
      console.error(`Error updating page.`, error);
    });
    onPageUpdated?.();
  }

  function onDelete() {
    console.debug(`Deleting page...`);
    Pages.deletePage(currentPage.PageID)
      .then(() => {
        console.debug(`Deleted page.`);
        Outline.deletePage(currentPage.PageID);

      })
      .catch(e => console.error(`Error deleting page.`, e));
    onPageDeleted?.();
  }

  function onDescribe() {
    setDescribing(true);
    formData.onDataChanged({
      changes: [
        {name: 'PageMetaTitle', value: ''},
        {name: 'PageMetaDescription', value: ''},
        {name: 'PageMetaKeywords', value: ''},
      ]
    })
    Pages.describePage(currentPage.PageID)
      .then(result => {
        setDescribing(false);
        formData.onDataChanged({
          changes: [
            {name: 'PageMetaTitle', value: result.title},
            {name: 'PageMetaDescription', value: result.description},
            {name: 'PageMetaKeywords', value: result.keywords},
          ]
        });
      })
      .catch(e => console.error(`Error describing page.`, e));
  }

  function isValidRoute(route) {
    return route?.match(/^\/[a-z0-9]+/) && !routes.includes(route);
  }

  return (<>
    <Row><Col><h5>Page Properties</h5></Col></Row>
    <Row>
      <Col sm={4}>
        <Form.Label
          htmlFor={'NavTitle'}
          column={'sm'}
        >
          Navigation Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'NavTitle'}
          name={'NavTitle'}
          value={formData.edits?.NavTitle || ''}
          onChange={(e) => formData.onDataChanged({name: 'NavTitle', value: e.target.value})}
        />
      </Col>

      <Col sm={3}>
        <Form.Label
          htmlFor={'PageRoute'}
          column={'sm'}
        >
          Page Route
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageRoute'}
          name={'PageRoute'}
          isValid={formData.isTouched('PageRoute') && isValidRoute(formData.edits?.PageRoute)}
          isInvalid={formData.isTouched('PageRoute') && !isValidRoute(formData.edits?.PageRoute)}
          value={formData.edits?.PageRoute || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageRoute', value: e.target.value})}
        />
      </Col>
      <Col>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaTitle'}
        >
          Meta Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaTitle'}
          value={formData.edits?.PageMetaTitle || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageMetaTitle', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={6}>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaDescription'}
        >
          Meta Description
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaDescription'}
          value={formData.edits?.PageMetaDescription || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageMetaDescription', value: e.target.value})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaKeywords'}
        >
          Meta Keywords
        </Form.Label>
        <Form.Control
          size={'sm'}
          id={'PageMetaKeywords'}
          value={formData.edits?.PageMetaKeywords || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageMetaKeywords', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Check
          className={'form-control-sm'}
          checked={formData.edits?.PageHidden || false}
          id={'PageHidden'}
          label={'Hide page from site navigation'}
          onChange={(e) => formData.onDataChanged({name: 'PageHidden', value: e.target.checked})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Check
          className={'form-control-sm'}
          checked={formData.edits?.RequiresLogin || false}
          id={'RequiresLogin'}
          label={'Requires user login'}
          onChange={(e) => formData.onDataChanged({name: 'RequiresLogin', value: e.target.checked})}
        />
      </Col>
    </Row>
    <Row className={'mt-2'}>
      <Col xs={'auto'} className={'pe-0'}>
        {onUpdate && isDataValid && (
          <Button
            className="me-2"
            size={'sm'}
            variant="primary"
            onClick={() => {
              onUpdate?.();
            }}
            disabled={!isDataValid() || !formData.isDataChanged()}
          >
            Update
          </Button>
        )}
        <Button
          size={'sm'}
          className="me-2"
          variant="secondary"
          onClick={() => formData.revert()}
          disabled={!formData.isDataChanged()}
        >
          Revert
        </Button>
        <OverlayTrigger
          delay={{show:1000}}
          overlay={<Tooltip id={"tip"}>Generate meta title, description and keywords using AI.</Tooltip>}
          container={modalRef}
        >
          <Button
            size={'sm'}
            style={{minWidth: '75px'}}
            className="me-2"
            variant="secondary"
            onClick={() => onDescribe()}
            disabled={describing}
          >
            {describing ? <Spinner size={'sm'}/> : <><BsStars size={15} className={'me-1'}/>Describe</>}
          </Button>
        </OverlayTrigger>
      </Col>
      <Col style={{textAlign: 'end'}} className={'ps-0'}>
        <Button
          size={'sm'}
          variant="danger"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete
        </Button>
      </Col>
    </Row>
    <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)} style={{zIndex: 1199}}>
      <Modal.Header><h5>Delete Page</h5></Modal.Header>
      <Modal.Body>Are you sure you want to delete this page? This action can't be undone.</Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
        <Button size="sm" variant="danger" onClick={() => {
          setShowDeleteConfirmation(false);
          onDelete();
        }}>Delete</Button>
      </Modal.Footer>
    </Modal>
  </>);
}