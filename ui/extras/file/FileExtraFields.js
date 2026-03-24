import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../../editor/FormEditor";
import {useEffect, useState} from "react";
import FileExtraIcon, {IconList} from "./FileExtraIcon";
import {getMimeType} from "../../../api/RestApi";

export default function FileExtraFields({fetchingDescription = false}) {

  // states
  const [baseFileType, setBaseFileType] = useState(null);

  const formData = useFormData();
  useEffect(() => {
    // set default values for display
    if (formData && !formData.edits.DisplayWidth) {
      formData.onDataChanged({name: 'DisplayWidth', value: 6})
    }
  }, [formData]);

  useEffect(() => {
    if (formData.edits.ExtraFile) {
      let mimeType;
      if (formData.edits.ExtraFile && !formData.edits.ExtraFile.type) {
        mimeType = getMimeType(formData.edits.ExtraFile);
      } else {
        mimeType = formData.edits.ExtraFile.type
      }
      const parts = mimeType.split('/');
      const baseType = parts[0];
      setBaseFileType(baseType);
    }
  }, [formData.edits.ExtraFile, setBaseFileType]);

  useEffect(() => {
    if (!formData.edits.ExtraDisplay) {
      switch (baseFileType) {
        case 'audio':
        case 'text':
          formData.onDataChanged({name: 'ExtraDisplay', value: 'embed'});
          break;
        case 'image':
        case 'video':
        case 'application':
        default:
          formData.onDataChanged({name: 'ExtraDisplay', value: 'link'});
          break;
      }
    }
  }, [formData, baseFileType])

  const labelCols = 4;
  return (<>
    <Row className="mt-2">
      <Form.Label
        className='required'
        column={'sm'}
        htmlFor={'ExtraFile'}
        sm={labelCols}
      >
        File to Upload
      </Form.Label>
      <Col>
        <Form.Control
          type="file"
          id="ExtraFile"
          name="ExtraFile"
          size="sm"
          onChange={(e) => formData.onDataChanged({name: 'ExtraFile', value: e.target.files[0]})}
        />
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        className='required'
        column={'sm'}
        htmlFor={'ExtraDisplay'}
        sm={labelCols}
      >
        Display File
      </Form.Label>
      <Col>
        <Form.Select
          id="ExtraDisplay"
          name="ExtraDisplay"
          size="sm"
          value={formData.edits.ExtraDisplay || ''}
          onChange={(e) => formData.onDataChanged({name: 'ExtraDisplay', value: e.target.value})}
        >
          <option value='link'>as a link in the same window</option>
          <option value='blank'>as a link to a new window</option>
          <option value='embed'>on the page</option>
        </Form.Select>
      </Col>
    </Row>
    <Row
      className="mt-2"
    >
      <Form.Label
        column={'sm'}
        htmlFor={'ExtraFilePrompt'}
        sm={labelCols}
      >
        Label
      </Form.Label>
      <Col>
        <Form.Control
          id="ExtraFilePrompt"
          name="ExtraFilePrompt"
          value={formData.edits.ExtraFilePrompt || ''}
          size="sm"
          onChange={(e) => formData.onDataChanged({name: 'ExtraFilePrompt', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row
      className="mt-2"
    >
      <Form.Label
        column={'sm'}
        htmlFor={'ExtraFileIcon'}
        sm={labelCols}
      >
        Icon
      </Form.Label>
      <Col className="col-1 me-2">
        <FileExtraIcon type={formData.edits.ExtraFileIcon} size={40}/>
      </Col>
      <Col xs='auto' style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Form.Select
          type="select"
          size="sm"
          name={'ExtraFileIcon'}
          value={formData.edits.ExtraFileIcon || ''}
          onChange={(e) => formData.onDataChanged({name: 'ExtraFileIcon', value: e.target.value})}
        >
          <option value=''>(none)</option>
          {IconList.map((item, index) => (
            <option key={index} value={item.value}>{item.label}</option>
          ))}
        </Form.Select>
      </Col>
    </Row>
    <Row
      className="mt-2"
    >
      <Form.Label
        htmlFor={"DisplayWidth"}
        column={'sm'}
        sm={labelCols}
      >
        Display Width
      </Form.Label>
      <Col sm={3}>
        <Form.Control
          type={'number'}
          id={'DisplayWidth'}
          value={formData.edits.DisplayWidth || 6}
          size={"sm"}
          min={1}
          max={12}
          onChange={(e) => formData.onDataChanged({name: 'DisplayWidth', value: parseInt(e.target.value)})}
        />
      </Col>
    </Row>
    {formData.edits.ExtraFile && (<>
      <Row className="mt-0">
        <Form.Label column="sm">Description</Form.Label>
      </Row>
      <Row className="mt-2">
        <Col>
          <Form.Control
            as="textarea"
            rows={2}
            size={"sm"}
            value={formData.edits.ExtraDescription || ''}
            onChange={e => formData.onDataChanged({name: 'ExtraDescription', value: e.target.value})}
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
            value={formData.edits.ExtraKeywords}
            onChange={e => formData.onDataChanged({name: 'ExtraKeywords', value: e.target.value})}
          />
        </Col>
      </Row>
    </>)}
  </>);
}