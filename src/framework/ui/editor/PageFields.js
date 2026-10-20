import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "./FormEditor";
import {isValidRoute} from "../../util/Validators";

export default function PageFields({outlineData}) {

  const formData = useFormData();

  return (<>
    <Row>
      <Col>
        <Form.Label
          htmlFor={'PageTitle'}
          column={'sm'}
          sm={2}
          className='required'
        >
          Page Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          name={'PageTitle'}
          value={formData.edits?.PageTitle || ''}
          isValid={formData.isTouched('PageTitle') && formData.edits.PageTitle?.length > 0}
          isInvalid={formData.isTouched('PageTitle') && !formData.edits.PageTitle?.length > 0}
          onChange={(e) => formData.onDataChanged({name: 'PageTitle', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          htmlFor={'PageRoute'}
          column={'sm'}
          className='required'
        >
          Page Route
        </Form.Label>
        <Form.Control
          size={'sm'}
          name={'PageRoute'}
          isValid={formData.isTouched('PageRoute') && isValidRoute(formData.edits, outlineData)}
          isInvalid={formData.isTouched('PageRoute') && !isValidRoute(formData.edits, outlineData)}
          value={formData.edits?.PageRoute || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageRoute', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          htmlFor={'NavTitle'}
          column={'sm'}
        >
          Navigation Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          name={'NavTitle'}
          value={formData.edits?.NavTitle || ''}
          onChange={(e) => formData.onDataChanged({name: 'NavTitle', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaTitle'}
        >
          Meta Title
        </Form.Label>
        <Form.Control
          size={'sm'}
          name={'PageMetaTitle'}
          value={formData.edits?.PageMetaTitle || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageMetaTitle', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaDescription'}
        >
          Meta Description
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          size={'sm'}
          name={'PageMetaDescription'}
          value={formData.edits.PageMetaDescription || ''}
          onChange={(e) => formData.onDataChanged({name: 'PageMetaDescription', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          column={'sm'}
          htmlFor={'PageMetaKeywords'}
        >
          Meta Keywords
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          size={'sm'}
          name={'PageMetaKeywords'}
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
          name={'PageHidden'}
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
          name={'RequiresLogin'}
          label={'Requires user login'}
          onChange={(e) => formData.onDataChanged({name: 'RequiresLogin', value: e.target.checked})}
        />
      </Col>
    </Row>
  </>);
}