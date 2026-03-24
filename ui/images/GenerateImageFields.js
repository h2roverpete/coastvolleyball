import {useFormData} from "../editor/FormEditor";
import {Col, Form, Row} from "react-bootstrap";
import {useEffect} from "react";

/**
 * @typedef ImageStyle
 * @property {string} value
 * @property {string} prompt
 */

/**
 * @type {[ImageStyle]}
 */
const ImageStyles = [
  {value: "PHOTOREALISM", prompt: 'photo realism'},
  {value: "DESIGN_SKETCH", prompt: 'design sketch'},
  {value: "FLAT_VECTOR_ILLUSTRATION", prompt: 'flat vector illustration'},
  {value: "GRAPHIC_NOVEL_ILLUSTRATION", prompt: 'graphic novel illustration'},
  {value: "3D_ANIMATED_FAMILY_FILM", prompt: '3D animated film'},
  {value: "MAXIMALISM", prompt: 'maximalism'},
  {value: "MIDCENTURY_RETRO", prompt: 'midcentury retro'},
  {value: "SOFT_DIGITAL_PAINTING", prompt: 'soft digital painting'},
]

/**
 * @typedef ImageSize
 * @property {number} width
 * @property {number} height
 * @property {string} prompt
 */

/**
 * @type {[ImageSize]}
 */
const ImageSizes = [
  {width: 1360, height: 1024, prompt: '4x3 horizontal'},
  {width: 1024, height: 1360, prompt: '4x3 vertical'},
  {width: 1536, height: 1024, prompt: '2x3 horizontal'},
  {width: 1024, height: 1536, prompt: '2x3 vertical'},
  {width: 1824, height: 1024, prompt: '16x9 horizontal'},
  {width: 1024, height: 1824, prompt: '16x9 vertical'},
  {width: 1024, height: 1024, prompt: 'square'},
]

export default function GenerateImageFields({siteId, pageId, pageSectionId}) {

  const formData = useFormData();

  useEffect(() => {
    if (!formData.edits.SiteID) {
      // set up query data
      formData.setData({
        SiteID: siteId,
        PageID: pageId,
        PageSectionID: pageSectionId,
        ImageSize: '1360x1024',
        ImagePrompt: '',
        ImageNegativePrompt: '',
        ImageStyle: 'PHOTOREALISM',
        ImageCount: 3,
        ImagePath: 'images/'
      })
    }
  }, [formData, pageId, pageSectionId, siteId]);

  const labelCols = 3;
  return (<>
    <Row className="mt-0">
      <Form.Label
        size={"sm"}
        htmlFor={"ImagePrompt"}
        column={'sm'}
      >
        Image Prompt
      </Form.Label>
    </Row>
    <Row>
      <Col>
        <Form.Control
          type="text"
          value={formData.edits?.ImagePrompt || ''}
          onChange={(e) => formData.onDataChanged({name: 'ImagePrompt', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        size={"sm"}
        htmlFor={"ImageNegativePrompt"}
        column={'sm'}
      >
        Negative Prompt (what you don't want)
      </Form.Label>
    </Row>
    <Row>
      <Col>
        <Form.Control
          type="text"
          value={formData.edits?.ImageNegativePrompt || ''}
          onChange={(e) => formData.onDataChanged({name: 'ImageNegativePrompt', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        size={"sm"}
        htmlFor={"ImageSize"}
        column={'sm'}
        sm={labelCols}
      >
        Image Size
      </Form.Label>
      <Col>
        <Form.Select
          name={'ImageSize'}
          value={formData.edits?.ImageSize || ''}
          size={"sm"}
          onChange={(e) => formData.onDataChanged({name: 'ImageSize', value: e.target.value})}
        >
          <>
            {ImageSizes.map((size, index) => (
              <option key={index} value={size.width + 'x' + size.height}>{size.prompt}</option>
            ))}
          </>
        </Form.Select>
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label
        size={"sm"}
        htmlFor={"ImageStyle"}
        column={'sm'}
        sm={labelCols}
      >
        Image Style
      </Form.Label>
      <Col>
        <Form.Select
          name={'ImageStyle'}
          value={formData.edits?.ImageStyle || ''}
          size={"sm"}
          onChange={(e) => formData.onDataChanged({name: 'ImageStyle', value: e.target.value})}
        >
          <>
            {ImageStyles.map((style, index) => (
              <option key={index} value={style.value}>{style.prompt}</option>
            ))}
          </>
        </Form.Select>
      </Col>
    </Row>
  </>);
}
