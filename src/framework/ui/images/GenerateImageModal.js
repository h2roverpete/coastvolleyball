import {Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Form, Spinner} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import GenerateImageFields from "./GenerateImageFields";
import {useState} from "react";
import {useSiteContext} from "../content/Site";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import Image from "react-bootstrap/Image";

export default function GenerateImageModal(
  {
    show,
    onHide,
    pageSectionData,
  }
) {

  const {siteData} = useSiteContext();
  const {pageData, updatePageSection} = usePageContext();
  const {PageSections} = useRestApi();
  const formData = useFormData();
  const {showErrorAlert} = useSiteContext();

  const [imageResults, setImageResults] = useState(/** @type {GeneratedImageData[]} */[]);
  const [generating, setGenerating] = useState(false);

  function onGenerate() {
    setGenerating(true);
    if (imageResults.length > 0) {
      deleteImageResults();
    }
    PageSections.generateSectionImages(pageData.PageID, pageSectionData.PageSectionID, formData.edits)
      .then(response => {
        setImageResults(response);
        setGenerating(false);
        if (!show) {
          // dialog already dismissed, clean up
          deleteImageResults();
        }
      })
      .catch(error => {
        showErrorAlert(error);
        setGenerating(false);
      });
  }

  function deleteImageResults() {
    console.debug(`Delete existing image results.`);
    for (const image of [...imageResults]) {
      PageSections.deleteGeneratedImage(image.PageID, image.PageSectionID, image.GeneratedImageID)
        .then(() => console.debug(`Generated image ${image.GeneratedImageID} deleted`))
        .catch(error => showErrorAlert(`Error deleting generated image.`, error));
    }
    setImageResults([]);
  }

  function onSelectImage(index) {

    console.debug(`Select image ${index}`);

    // create updated data for dynamo
    const selectedImage = imageResults[index];
    const parts = selectedImage.Image.split("/");
    const fileName = parts[parts.length - 1];
    const {
      Extras,
      ...newData
    } = pageSectionData;
    newData.SectionImage = fileName;

    // update local copy of page section
    updatePageSection({
      ...pageSectionData,
      SectionImage: fileName,
      GeneratedImageID: selectedImage.GeneratedImageID,
    });

    // hide the UI
    onHide?.();

    // delete old section image if present
    if (pageSectionData.SectionImage) {
      PageSections.deleteSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID).then(() => {
        console.debug(`Old section image deleted.`);
      }).catch(error => showErrorAlert(`Error deleting previous image.`, error));
    }

    // delete unused images
    for (const image of imageResults) {
      if (image !== selectedImage) {
        PageSections.deleteGeneratedImage(image.PageID, image.PageSectionID, image.GeneratedImageID)
          .then(() => console.debug(`Generated image ${image.GeneratedImageID} deleted`))
          .catch(error => showErrorAlert(`Error deleting generated image.`, error));
      }
    }

    // copy generated image to section image
    PageSections.insertOrUpdatePageSection(newData).then(() => {
      console.debug(`Page section image updated.`);
    }).catch(error => showErrorAlert(`Error updating image.`, error));


  }

  function onCancel() {
    deleteImageResults();
    onHide?.();
  }

  return (
    <Modal show={show}>
      <ModalHeader>
        <h5>Add a Generated Image</h5>
      </ModalHeader>
      <ModalBody>
        <>
          <GenerateImageFields
            siteId={siteData.SiteID}
            pageId={pageData.PageID}
            pageSectionId={pageSectionData.PageSectionID}
          />
          {generating && (<>
            <Row className="mt-3">
              <Spinner className="ms-3"/>
              <Form.Label column="sm">Generating images...</Form.Label>
            </Row>
          </>)}
          {imageResults?.length > 0 && (<>
            <Row className="mt-4">
              <Form.Label column="sm">Select an Image or Click "Generate" again for more options.</Form.Label>
            </Row>
            <Row className="mt-2"><>
              {imageResults.map((item, index) => (
                <Image
                  key={item.GeneratedImageID}
                  className={`col-12 col-sm-4`}
                  src={siteData.SiteRootUrl + '/' + item.Image}
                  onClick={() => onSelectImage(index)}
                  style={{cursor: 'pointer'}}
                />
              ))}
            </>
            </Row></>)}
        </>
      </ModalBody>
      <ModalFooter>
        <Col>
          <Button
            size="sm"
            variant="primary"
            onClick={onGenerate}
            disabled={!formData.edits.ImagePrompt || generating}
          >
            Generate
          </Button>
        </Col>
        <Col className='text-end'>
          <Button
            size="sm"
            variant="secondary"
            className="me-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Col>
      </ModalFooter>
    </Modal>
  )
}
