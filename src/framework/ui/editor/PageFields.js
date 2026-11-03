import {Button, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import {useFormData} from "./FormEditor";
import {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {BsStars} from "react-icons/bs";
import CrudButtons from "./CrudButtons";

export default function PageFields({data, pageId, siteId, onUpdate, onDelete, onCancel}) {

  const {Pages} = useRestApi();
  const {outlineData, showErrorAlert, Outline} = useSiteContext();

  const formData = useFormData();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [describing, setDescribing] = useState(false);

  useEffect(() => {
    if (data) {
      // use provided data
      formData.update(data);
    } else if (pageId) {
      // fetch data from REST API
      Pages.getPage(pageId).then((result) => {
        formData.update(result);
      }).catch(error => {
        showErrorAlert(`Error loading page`, error);
      })
    } else {
      // default values
      formData.update({SiteID: siteId});
    }
  }, [pageId, data, showErrorAlert, Pages]);

  useEffect(() => {
    if (outlineData && formData.edits.PageID) {
      const routeList = [];
      for (const page of outlineData) {
        if (page.PageID !== formData.edits.PageID) {
          routeList.push(page.PageRoute);
        }
      }
      setRoutes(routeList);
    }
  }, [outlineData]);

  function isDataValid() {
    return isValidRoute(formData.edits?.PageRoute)
  }

  function handleUpdate() {
    Pages.insertOrUpdatePage(formData.edits).then((result) => {
      formData.update(result)
      Outline.updatePage(result);
      onUpdate?.(result);
    }).catch((error) => {
      console.error(`Error updating page.`, error);
    });
  }

  function handleDelete() {
    Pages.deletePage(formData.edits.PageID)
      .then((result) => {
        Outline.deletePage(formData.edits.PageID);
        onDelete?.(result);
      })
      .catch(e => console.error(`Error deleting page.`, e));
  }

  function handleDescribe() {
    setDescribing(true);
    formData.onDataChanged({
      changes: [
        {name: 'PageMetaTitle', value: ''},
        {name: 'PageMetaDescription', value: ''},
        {name: 'PageMetaKeywords', value: ''},
      ]
    })
    Pages.describePage(formData.edits.PageID)
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
    return route?.match(/^\/[a-z0-9/]+/) && !routes.includes(route);
  }

  const extraButtons = <>{formData?.edits.PageID &&
    <Button
      className="me-2"
      size={'sm'}
      style={{width: '100px'}}
      variant={'secondary'}
      onClick={handleDescribe}
    >
      {describing ? <Spinner size={'sm'}/> : <span><BsStars size={'15'} className={'me-1'}/>Describe</span>}
    </Button>
  }</>;

  return (<>
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
    <Row>
      <Col sm={5} style={{maxWidth: '225px'}}>
        <Form.Check
          className={'form-control-sm'}
          checked={formData.edits?.RequiresPassword || false}
          id={'RequiresPassword'}
          label={'Requires password'}
          onChange={(e) => formData.onDataChanged({name: 'RequiresPassword', value: e.target.checked})}
          inline
        />
      </Col>
      <Col>
        <Form.Control
          type={'password'}
          size={'sm'}
          sm={4}
          id={'RequiresPassword'}
          value={formData.edits?.PagePassword || ''}
          disabled={!formData.edits?.RequiresPassword}
          onChange={(e) => formData.onDataChanged({name: 'PagePassword', value: e.target.value})}
        />
      </Col>
    </Row>
    <CrudButtons
      keyName={'PageID'}
      onUpdate={handleUpdate}
      isDataValid={isDataValid}
      onDelete={() => setShowDeleteConfirmation(true)}
      extraButtons={extraButtons}
      onCancel={onCancel}
    />
    <Modal show={showDeleteConfirmation} onHide={() => setShowDeleteConfirmation(false)} style={{zIndex: 1199}}>
      <Modal.Body>
        <h5>Delete Page</h5>
        <div>Are you sure you want to delete this page? This action can't be undone.</div>
        <div className={'mt-4 d-flex justify-content-end align-items-center gap-4'}>
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={() => {
            setShowDeleteConfirmation(false);
            handleDelete();
          }}>Delete</Button>
        </div>
      </Modal.Body>
    </Modal>
  </>);
}