import {useNavigate} from "react-router";
import {usePageContext} from "../content/Page";
import React, {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {useFormData} from "./FormEditor";
import {Button, Col, Form, Modal, Row} from "react-bootstrap";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";

/**
 * Show modal dialog to create a new page
 * @param show {boolean}
 * @param setShow {function(Boolean)}
 * @returns {Element}
 * @constructor
 */
export default function NewPageModal({show, setShow}) {

  const {siteData, Outline, outlineData} = useSiteContext();
  const {pageData} = usePageContext();
  const {Pages, PageSections} = useRestApi();
  const navigate = useNavigate();
  const formData = useFormData();
  const {hasPermission} = useAuth();

  const [routes, setRoutes] = useState([]);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.SITE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (canEdit && outlineData && pageData) {
      const routeList = [];
      for (const page of outlineData) {
        if (page.PageID !== pageData.PageID) {
          routeList.push(page.PageRoute);
        }
      }
      console.debug(`Loaded route list: ${JSON.stringify(routeList)}`);
      setRoutes(routeList);
    }
  }, [outlineData, pageData, canEdit]);

  if (!canEdit) {
    return <></>;
  }

  function isDataValid() {
    return isValidTitle(formData.edits.PageTitle) && isValidRoute(formData.edits.PageRoute);
  }

  function isValidTitle(title) {
    return title && title.match[/[a-zA-Z]/] !== null;
  }

  function isValidRoute(route) {
    return route && route.match(/^\/[a-z0-9]+$/) !== null && !routes.includes(route);
  }

  function insertNewPage() {
    console.debug(`Insert new page...`);
    Pages.insertOrUpdatePage({
      SiteID: siteData.SiteID,
      ParentID: 0,
      PageTitle: formData.edits.PageTitle,
      NavTitle: formData.edits.PageTitle,
      PageRoute: formData.edits.PageRoute,
      PageHidden: formData.edits.PageHidden,
    })
      .then((newPage) => {
        console.debug(`Page inserted.`);
        PageSections.insertOrUpdatePageSection({
          PageID: newPage.PageID,
          ParentID: 0
        }).then((newSection) => {
          console.debug(`Page section inserted.`);
          setShow?.(false);
          formData.revert();
          Outline.addPage(newPage);
          navigate(newPage.PageRoute);
        }).catch(e => console.error(`Error inserting new page section.`, e));
      }).catch(e => console.error(`Error inserting new page.`, e));
  }

  function onCancel() {
    formData.revert();
    setShow?.(false);
  }

  return (
    <Modal
      show={show}
      onHide={onCancel}
      className={'Editor'}
    >
      <Modal.Header><h5>New Page</h5></Modal.Header>
      <Modal.Body>
        <Row>
          <Form.Label
            htmlFor={'PageTitle'}
            column={'sm'}
            sm={2}
            className={'required'}
          >
            Title
          </Form.Label>
          <Col>
            <Form.Control
              size={'sm'}
              isValid={formData.isTouched('PageTitle') && formData.edits.PageTitle.length > 0}
              isInvalid={formData.isTouched('PageTitle') && formData.edits.PageTitle.length === 0}
              id={'PageTitle'}
              name={'PageTitle'}
              value={formData.edits.PageTitle || ''}
              placeholder={'Title'}
              onChange={(e) => {
                formData.onDataChanged({name: 'PageTitle', value: e.target.value})
              }}
            />
          </Col>
        </Row>
        <Row className={'mt-2'}>
          <Form.Label
            htmlFor={'PageRoute'}
            column={'sm'}
            sm={2}
            className={`required`}
          >
            Route
          </Form.Label>
          <Col>
            <Form.Control
              size={'sm'}
              isValid={formData.isTouched('PageRoute') && isValidRoute(formData.edits.PageRoute)}
              isInvalid={formData.isTouched('PageRoute') && !isValidRoute(formData.edits.PageRoute)}
              id={'PageRoute'}
              name={'PageRoute'}
              placeholder={'/page'}
              type="text"
              value={formData.edits.PageRoute || ''}
              onChange={(e) => {
                formData.onDataChanged({name: 'PageRoute', value: e.target.value})
              }}
            />
          </Col>
        </Row>
        <Row>
          <Form.Label
            column={'sm'}
            sm={2}
            htmlFor='PageHidden'
          />
          <Col>
            <Form.Check
              className={'form-control-sm'}
              id={'PageHidden'}
              label={'Hide page from site navigation'}
              checked={formData.edits.PageHidden === true}
              onChange={(e) => {
                formData.onDataChanged({name: 'PageHidden', value: e.target.checked})
              }}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button
          size={'sm'}
          variant={"secondary"}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size={'sm'}
          variant="primary"
          disabled={!isDataValid()}
          onClick={insertNewPage}
        >
          Create New Page
        </Button>
      </Modal.Footer>
    </Modal>
  );
}