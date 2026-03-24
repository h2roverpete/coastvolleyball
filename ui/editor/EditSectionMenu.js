import {Button, Modal, ModalBody, ModalFooter, ModalHeader, OverlayTrigger, Tooltip} from "react-bootstrap";
import {BsThreeDotsVertical} from "react-icons/bs";
import {useSiteContext} from "../content/Site";
import {usePageContext} from "../content/Page";
import {useTouchContext} from "../../util/TouchProvider";
import React, {useState} from "react";
import {loremIpsum} from "lorem-ipsum";
import {useRestApi} from "../../api/RestApi";
import GenerateImageModal from "../images/GenerateImageModal";
import FormEditor from "./FormEditor";

/**
 * Dropdown menu for section editing
 *
 * @param pageSectionData {PageSectionData}               Section data.
 * @param editButtonRef {RefObject<HTMLButtonElement>}    Reference to the dropdown button.
 * @param titleApi {EditableAPI}                          API for editing section title.
 * @param textApi {EditableAPI}                           API for editing section text.
 * @param setEditing {function(boolean)}                  Callback to notify we are editing.
 * @param onTextChanged {DataCallback}                    Callback to receive text changes (for inserting Lorem Ipsum)
 * @param dropRef {RefObject<DropFunctions>}              File drop target API.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function EditSectionMenu(
  {
    pageSectionData,
    editButtonRef,
    titleApi,
    textApi,
    setEditing,
    onTextChanged,
    dropRef,
  }
) {

  // imports
  const {PageSections} = useRestApi();
  const {
    sectionData,
    setSectionData,
    deletePageSection,
    updatePageSection,
    addExtraModal,
  } = usePageContext();
  const {
    siteData,
    showErrorAlert,
  } = useSiteContext();
  const {supportsHover} = useTouchContext();

  // states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showGenerateImageModal, setShowGenerateImageModal] = useState(false);

  function onInsertLoremIpsum() {
    const textContent = loremIpsum(
      {
        format: 'html',
        count: 4,
        units: 'paragraphs'
      });
    onTextChanged({textContent: textContent, textAlign: pageSectionData.TextAlign});
  }

  function onDeleteSection() {
    if (pageSectionData) {
      PageSections.deletePageSection(pageSectionData.PageID, pageSectionData.PageSectionID)
        .then((result) => {
          console.debug(`Page section deleted.`)
          deletePageSection(result.PageSectionID);
        })
        .catch(error => {
          showErrorAlert(`Error deleting page section.`, error)
        });
    }
  }

  function onMoveUp() {
    if (sectionData && pageSectionData) {
      let before;
      let current;
      for (const section of sectionData) {
        if (section.PageSectionID === pageSectionData.PageSectionID) {
          current = section;
          break;
        } else {
          before = section;
        }
      }
      if (current && before) {
        let seq = current.PageSectionSeq;
        current.PageSectionSeq = before.PageSectionSeq;
        before.PageSectionSeq = seq;
        console.debug(`Moving section up...`);
        updatePageSection(current);
        updatePageSection(before);
        PageSections.insertOrUpdatePageSection(before)
          .then(() => {
            PageSections.insertOrUpdatePageSection(current)
              .then(() => {
                console.debug(`Section moved up.`);
              })
              .catch(error => showErrorAlert(`Error moving page section up.`, error));
          })
          .catch(error => showErrorAlert(`Error moving page section up.`, error));
      } else {
        showErrorAlert(`Section sequence error, can't move up.`);
      }
    }
  }

  function onMoveDown() {
    if (sectionData && pageSectionData) {
      let current;
      let next;
      for (const section of sectionData) {
        if (section.PageSectionID === pageSectionData.PageSectionID) {
          current = section;
        } else if (current) {
          next = section;
          break;
        }
      }
      if (current && next) {
        let seq = current.PageSectionSeq;
        current.PageSectionSeq = next.PageSectionSeq;
        next.PageSectionSeq = seq;
        console.debug(`Moving section down...`);
        updatePageSection(next);
        updatePageSection(current);
        PageSections.insertOrUpdatePageSection(next)
          .then(() => {
            PageSections.insertOrUpdatePageSection(current)
              .then(() => {
                console.debug(`Section moved down.`);
              })
              .catch(error => showErrorAlert(`Error moving page section down.`, error));
          })
          .catch(error => showErrorAlert(`Error moving page section down.`, error));
      } else {
        showErrorAlert(`Section sequence error, can't move down.`);
      }
    }
  }

  function onNewSectionAbove() {
    if (sectionData && pageSectionData) {
      console.debug(`Adding page section above...`);
      PageSections.insertOrUpdatePageSection({
        PageID: pageSectionData.PageID,
        PageSectionSeq: pageSectionData.PageSectionSeq,
      }).then((newSection) => {
        console.debug(`Added page section.`);
        for (const section of sectionData) {
          if (section.PageSectionSeq >= newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
            }).catch(error => showErrorAlert(`Error updating section sequence.`, error));
          }
        }
        const newSectionData = [...sectionData, newSection]
        newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
        setSectionData(newSectionData);
      }).catch(error => showErrorAlert(`Error adding section.`, error));
    }
  }

  function onNewSectionBelow() {
    if (sectionData && pageSectionData) {
      console.debug(`Adding page section below...`);
      PageSections.insertOrUpdatePageSection({
        PageID: pageSectionData.PageID,
        PageSectionSeq: pageSectionData.PageSectionSeq + 1,
      }).then((newSection) => {
        console.debug(`Added page section.`);
        for (const section of sectionData) {
          if (section.PageSectionSeq >= newSection.PageSectionSeq) {
            console.debug(`Updating section sequence.`);
            section.PageSectionSeq++;
            PageSections.insertOrUpdatePageSection(section).then((result) => {
              console.debug(`Updated section ${result.PageSectionID} sequence.`);
            }).catch(error => showErrorAlert(`Error updating section sequence.`, error));
          }
        }
        const newSectionData = [...sectionData, newSection]
        newSectionData.sort((a, b) => a.PageSectionSeq - b.PageSectionSeq);
        setSectionData(newSectionData);
      }).catch(error => showErrorAlert(`Error adding section.`, error));
    }
  }

  function onEditTitle() {
    // start editing section title
    titleApi.startEditing();
    editButtonRef.current.hidden = true;
    setEditing(true);
  }

  function onEditText() {
    // start editing section text
    textApi.startEditing();
    editButtonRef.current.hidden = true;
    setEditing(true);
  }

  return (<>
    <div className="Editor EditSectionMenu dropdown">
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip>Edit section</Tooltip>}
        delay={{show: 1000}}
      >
        <Button
          variant={siteData?.SiteTheme}
          size="sm"
          className={`EditButton EditSectionButton`}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          ref={editButtonRef}
          hidden={supportsHover}
        ><BsThreeDotsVertical/></Button>
      </OverlayTrigger>
      <ul className="dropdown-menu Editor" style={{cursor: 'pointer'}}>
        <li>
          <button className="dropdown-item"
                  onClick={onEditTitle}>{`${pageSectionData?.SectionTitle?.length > 0 ? 'Edit' : 'Add'} Section Title`}</button>
        </li>
        <li>
          <button className="dropdown-item"
                  onClick={onEditText}>{`${pageSectionData?.SectionText?.length > 0 ? 'Edit' : 'Add'} Section Text`}</button>
        </li>
        {!pageSectionData.SectionText && (
          <li>
            <button className="dropdown-item" onClick={() => onInsertLoremIpsum()}>Add Placeholder Text</button>
          </li>
        )}
        <li>
          <button className="dropdown-item"
                  onClick={() => dropRef.current?.selectFile()}>{`${pageSectionData?.SectionImage?.length > 0 ? 'Replace' : 'Add'} Section Image`}</button>
        </li>
        <li>
          <button className="dropdown-item"
                  onClick={() => setShowGenerateImageModal(true)}>{`${pageSectionData?.SectionImage?.length > 0 ? 'Replace with' : 'Insert'} Generated Image`}</button>
        </li>
        <li>
          <button className="dropdown-item"
                  onClick={() => addExtraModal({pageSectionId: pageSectionData.PageSectionID})}>Add Extra
          </button>
        </li>
        {pageSectionData.PageSectionID !== sectionData[0].PageSectionID && (
          <li>
            <button className="dropdown-item" onClick={onMoveUp}>Move Up</button>
          </li>
        )}
        {pageSectionData.PageSectionID !== sectionData[sectionData.length - 1].PageSectionID && (
          <li>
            <button className="dropdown-item" style={{marginLeft: '0'}} onClick={onMoveDown}>Move
              Down
            </button>
          </li>
        )}
        <li>
          <button className="dropdown-item" style={{marginLeft: '0'}}
                  onClick={onNewSectionAbove}>New Section Above
          </button>
        </li>
        <li>
          <button className="dropdown-item" style={{marginLeft: '0'}}
                  onClick={onNewSectionBelow}>New Section Below
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={() => setShowDeleteConfirmation(true)}> Delete Section</button>
        </li>
      </ul>
    </div>
    <Modal
      show={showDeleteConfirmation}
      onHide={() => setShowDeleteConfirmation(false)}
      className={'Editor'}
    >
      <ModalHeader><h5>Delete Page Section</h5></ModalHeader>
      <ModalBody>Are you sure you want to delete this section of the page? This action cannot be
        undone.</ModalBody>
      <ModalFooter>
        <Button size="sm" variant="secondary" onClick={() => setShowDeleteConfirmation(false)}>Cancel
        </Button>
        <Button size="sm" variant="danger" onClick={() => {
          onDeleteSection();
          setShowDeleteConfirmation(false)
        }}>Delete Section
        </Button>
      </ModalFooter>
    </Modal>
    <FormEditor>
      <GenerateImageModal
        show={showGenerateImageModal}
        onHide={() => setShowGenerateImageModal(false)}
        pageSectionData={pageSectionData}
      />
    </FormEditor>
  </>);
}