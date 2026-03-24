import {Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Form, Spinner} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import {useFormData} from "../editor/FormEditor";
import {useSiteContext} from "../content/Site";
import {BsStars} from "react-icons/bs";

/**
 * Modal for adding description and keywords to site content.
 *
 * Wrap this in a content-specific component and implement show() and onHide()
 * as well as content-specific implementations of onDescribe() and onSubmit()
 *
 * @param show {boolean}                                Flag to show/hide the modal.
 * @param onHide {function()}                           Callback requesting to hide the modal.
 * @param onSubmit {function(SummaryData)}              Callback to commit the image description.
 * @param onDescribe {function():Promise<SummaryData>}  Describe the image.
 * @param data {SummaryData}                            Data to display.
 * @param [title] {string}                              Title of modal.
 * @param [prompt] {string}                             Prompt to display in the modal.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function DescribeContentModal(
  {
    show,
    onHide,
    title,
    prompt,
    onUpdate,
    onDescribe,
    data
  }
) {

  const {showErrorAlert} = useSiteContext();
  const formData = useFormData();

  const [describing, setDescribing] = useState(false);

  useEffect(() => {
    // update default values
    if (data && data.id !== formData.edits.id) {
      formData.update(data);
    }
  }, [formData, data]);

  const handleDescribe = useCallback(() => {
    setDescribing(true);
    formData.onDataChanged({
      changes: [
        {name: "description", value: ''},
        {name: "keywords", value: ''},
      ]
    });
    onDescribe?.()
      .then(data => {
        setDescribing(false);
        formData.onDataChanged({
          changes: [
            {name: "description", value: data.description},
            {name: "keywords", value: data.keywords},
          ]
        })
      })
      .catch(err=>showErrorAlert(`Error describing content.`,err));
  }, [setDescribing, formData, onDescribe, showErrorAlert]);

  function handleCancel() {
    setDescribing(false);
    formData.update({});
    onHide?.();
  }

  function handleUpdate() {
    onHide?.();
    onUpdate?.(formData.edits);
  }

  return (
    <Modal show={show} className={'Editor'}>
      <ModalHeader>
        <h5>{title ? <>{title}</> : <>Description & Keywords</>}</h5>
      </ModalHeader>
      <ModalBody>
        {prompt && <Row><Col>{prompt}</Col></Row>}
        <Row className="mt-0">
          <Form.Label column="sm">Description</Form.Label>
        </Row>
        <Row className="mt-2">
          <Col>
            <Form.Control
              as="textarea"
              rows={2}
              size="sm"
              value={formData.edits.description || ''}
              onChange={e => formData.onDataChanged({name: 'description', value: e.target.value})}
            />
          </Col>
        </Row>
        <Row className="mt-2">
          <Form.Label column="sm">Keywords</Form.Label>
        </Row>
        <Row className="mt-2">
          <Col>
            <Form.Control
              as="textarea"
              rows={2}
              size={"sm"}
              value={formData.edits.keywords || ''}
              onChange={e => formData.onDataChanged({name: 'keywords', value: e.target.value})}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Col className="text-start">
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={handleDescribe}
            disabled={describing}
            style={{minWidth: '100px'}}
          >
            {describing ? <Spinner size="sm"/> : <><BsStars size={15} className={'me-1'}/>Describe</>}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={()=>formData.revert()}
            disabled={!formData.isDataChanged()}
          >
            Revert
          </Button>
        </Col>
        <Col className='text-end'>
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="me-2"
            onClick={handleUpdate}
            disabled={!formData.isDataChanged()}
          >
            Update
          </Button>
        </Col>
      </ModalFooter>
    </Modal>
  )
}
