import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BsCamera} from "react-icons/bs";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "./Page";
import {useSiteContext} from "./Site";
import {useTouchContext} from "../../util/TouchProvider";
import React, {useState} from "react";
import FormEditor from "../editor/FormEditor";
import DescribeSectionImageModal from "../editor/DescribeSectionImageModal";

export default function PageSectionImageMenu({pageSectionData, buttonRef}) {

  const {PageSections} = useRestApi();
  const {updatePageSection} = usePageContext();
  const {supportsHover} = useTouchContext();
  const {siteData, showErrorAlert} = useSiteContext();

  // states
  const [showDescribeImageModal, setShowDescribeImageModal] = useState(false);

  function setImageAlign(align) {
    pageSectionData.ImageAlign = align;
    console.debug(`Updating image alignment...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image alignment.`)
      })
      .catch(error => showErrorAlert(`Error updating image alignment.`, error));
    updatePageSection(pageSectionData);
  }

  function setImagePosition(position) {
    pageSectionData.ImagePosition = position;
    if (position === 'beside' && pageSectionData.ImageAlign !== 'left' && pageSectionData.ImageAlign !== 'right') {
      // fix alignment to be side by side
      pageSectionData.ImageAlign = 'right';
    }
    console.debug(`Updating image position...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image position.`)
      })
      .catch(error => showErrorAlert(`Error updating image position.`, error));
    updatePageSection(pageSectionData);
  }

  function hideImageFrame(hide) {
    pageSectionData.HideImageFrame = hide;
    console.debug(`Updating image frame...`);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image frame.`)
      })
      .catch(error => showErrorAlert(`Error updating image frame.`, error));
    updatePageSection(pageSectionData);
  }

  function deleteImage() {
    console.debug(`Deleting section image...`);
    PageSections.deleteSectionImage(pageSectionData.PageID, pageSectionData.PageSectionID)
      .then(() => {
        console.debug(`Deleted section image.`)
      })
      .catch(error => showErrorAlert(`Error deleting section image.`, error));
    pageSectionData.SectionImage = null;
    updatePageSection(pageSectionData);
  }

  function setImageWidth(width) {
    console.debug(`Setting image width to ${width}...`);
    pageSectionData.ImageWidth = width;
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => {
        console.debug(`Updated image width.`)
      }).catch(error => showErrorAlert(`Error updating image width.`, error));
    updatePageSection(pageSectionData);
  }

  function getImageWidth() {
    if (pageSectionData) {
      return pageSectionData.ImageWidth > 0 ? pageSectionData.ImageWidth : pageSectionData.ImagePosition === 'beside' ? 7 : 'auto';
    } else {
      return 'auto';
    }
  }

  function handleUpdateImageDescription(data) {
    updatePageSection({...data});
  }

  return (<>
    <div
      className="EditSectionImage Editor dropdown"
      ref={buttonRef}
      hidden={supportsHover}
    >
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip>Edit image properties</Tooltip>}
        delay={{show: 1000}}
      >
        <Button
          variant={siteData?.SiteTheme}
          size="sm"
          className={`EditButton EditImageButton`}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        ><BsCamera/></Button>
      </OverlayTrigger>
      <ul className="dropdown-menu Editor" style={{cursor: 'pointer', zIndex: 100}}>
        {pageSectionData.ImageAlign !== 'left' && (
          <li>
            <button className="dropdown-item" onClick={() => setImageAlign('left')}>Align Left</button>
          </li>)}
        {pageSectionData.ImageAlign !== 'center' && pageSectionData.ImagePosition === 'above' && (
          <li>
            <button className="dropdown-item" onClick={() => setImageAlign('center')}>Align Center</button>
          </li>)}
        {pageSectionData.ImageAlign !== 'right' && (
          <li>
            <button className="dropdown-item" onClick={() => setImageAlign('right')}>Align Right</button>
          </li>)}
        {pageSectionData.ImagePosition !== 'above' && (
          <li>
            <button className="dropdown-item" onClick={() => setImagePosition('above')}>Above Text</button>
          </li>)}
        {pageSectionData.ImagePosition !== 'beside' && (
          <li>
            <button className="dropdown-item" onClick={() => setImagePosition('beside')}>Beside Text</button>
          </li>)}
        {pageSectionData.ImagePosition !== 'parallax' && (
          <li>
            <button className="dropdown-item" onClick={() => setImagePosition('parallax')}>Parallax</button>
          </li>)}
        {getImageWidth() > 1 && (
          <li>
            <button className="dropdown-item"
                    onClick={() => setImageWidth(getImageWidth() - 1)}>Make Smaller
            </button>
          </li>)
        }
        {getImageWidth() < 12 && (
          <li>
            <button className="dropdown-item"
                    onClick={() => setImageWidth(getImageWidth() + 1)}>Make Larger
            </button>
          </li>)
        }
        {
          pageSectionData.HideImageFrame ?
            (<li>
              <button className="dropdown-item" onClick={() => hideImageFrame(false)}>Show Image Frame</button>
            </li>) :
            (<li>
              <button className="dropdown-item" onClick={() => hideImageFrame(true)}>Hide Image Frame</button>
            </li>)
        }
        <li>
          <button className="dropdown-item" onClick={() => setShowDescribeImageModal(true)}>Describe Image</button>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => deleteImage()}>Delete Image</button>
        </li>
      </ul>
    </div>
    <FormEditor>
      <DescribeSectionImageModal
        show={showDescribeImageModal}
        onHide={() => setShowDescribeImageModal(false)}
        onUpdate={handleUpdateImageDescription}
        data={pageSectionData}
      />
    </FormEditor>
  </>)
}