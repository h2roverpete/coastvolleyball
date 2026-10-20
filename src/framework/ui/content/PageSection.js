import {lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "./Page";
import PageSectionImage from "./PageSectionImage";
import Extras from "../extras/Extras";
import {useSiteContext} from "./Site";
import {useTouchContext} from "../../util/TouchProvider";
import './PageSection.css';

const EditableField = lazy(() => import("../editor/EditableField"));
const EditSectionMenu = lazy(() => import("../editor/EditSectionMenu"));
const FileDropTarget = lazy(() => import("../editor/FileDropTarget"));
const {DropState} = lazy(() => import("../editor/FileDropTarget"));

/**
 * Display a page section.
 *
 * Add editing features if logged in with edit permission.
 *
 * @param sectionData{PageSectionData}  Data for page section.
 * @constructor
 */
export default function PageSection({pageSectionData, canEdit = false}) {

  // imports
  const {supportsHover} = useTouchContext();
  const {PageSections} = useRestApi();
  const {
    updatePageSection,
  } = usePageContext();
  const {showErrorAlert, siteData} = useSiteContext();

  // states
  const [editing, setEditing] = useState(false);
  const [titleApi, setTitleApi] = useState(null);
  const [textApi, setTextApi] = useState(null);

  // refs
  const dropRef = useRef(/** @type {DropFunctions} */ null);
  const sectionTitleRef = useRef(null);
  const sectionTextRef = useRef(null);
  const sectionImageRef = useRef(null);
  const sectionRef = useRef(null);
  const editButtonRef = useRef(null);

  const onTitleChanged = useCallback(({textContent, textAlign}) => {
    // commit title edits
    console.debug(`Update section title...`);
    pageSectionData.SectionTitle = textContent;
    pageSectionData.TitleAlign = textAlign;
    updatePageSection(pageSectionData);
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => console.debug(`Updated section title.`))
      .catch(error => showErrorAlert(`Error updating section title.`, error));
    editButtonRef.current.hidden = false;
    setEditing(false);
  }, [pageSectionData, updatePageSection, PageSections, showErrorAlert]);

  const onTextChanged = useCallback(({textContent, textAlign}) => {
    // commit text edits
    console.debug(`Update section text...`);
    pageSectionData.SectionText = textContent;
    pageSectionData.TextAlign = textAlign;
    PageSections.insertOrUpdatePageSection(pageSectionData)
      .then(() => console.debug(`Section text updated.`))
      .catch(error => showErrorAlert(`Error updating section text.`, error));
    editButtonRef.current.hidden = false;
    setEditing(false);
    updatePageSection(pageSectionData);
  }, [pageSectionData, updatePageSection, PageSections, showErrorAlert]);

  const onEditCanceled = useCallback(() => {
    // cancel editing
    editButtonRef.current.hidden = false;
    setEditing(false);
  }, [setEditing]);

  useEffect(() => {
    // manage drag scripts
    if (pageSectionData.SectionImage && sectionImageRef.current && dropRef.current) {
      // make section image the drop target
      sectionImageRef.current.ondragenter = (e) => dropRef.current.onDragEnter(e, DropState.REPLACE);
      if (sectionRef.current) {
        sectionRef.current.ondragenter = undefined;
      }
    } else if (!pageSectionData.SectionImage && sectionRef.current && dropRef.current) {
      // make whole section the drop target
      sectionRef.current.ondragenter = (e) => dropRef.current.onDragEnter(e, DropState.ADD);
      if (sectionImageRef.current) {
        sectionImageRef.current.ondragenter = undefined;
      }
    }
  }, [sectionImageRef, pageSectionData])

  const onUploadFile = useCallback((file) => {
    // upload a file that has been dropped, selected from a file dialog
    // or pasted from the clipboard
    dropRef.current.setDropState(DropState.UPLOADING);
    PageSections.uploadSectionImage(siteData.SiteID, pageSectionData, file)
      .then((result) => {
        console.debug(`Image uploaded successfully.`);
        dropRef.current.setDropState(DropState.HIDDEN);
        updatePageSection({
          ...pageSectionData,
          SectionImage: result.SectionImage,
        });
      })
      .catch(e => {
        showErrorAlert(`Error uploading image.`, e);
        dropRef.current.setDropState(DropState.HIDDEN);
      });
  }, [PageSections, pageSectionData, updatePageSection, showErrorAlert, siteData?.SiteID]);

  const sectionTitle = useMemo(() => (
    <h2
      ref={sectionTitleRef}
      className={'SectionTitle'}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionTitle}}
      data-testid={`SectionTitle-${pageSectionData.PageSectionID}`}
      style={{textAlign: pageSectionData.TitleAlign, width: '100%'}}
    />
  ), [pageSectionData]);

  const sectionText = useMemo(() => (
    <div
      className={`SectionText`}
      style={{textAlign: pageSectionData.TextAlign}}
      dangerouslySetInnerHTML={{__html: pageSectionData.SectionText}}
      ref={sectionTextRef}
    />
  ), [pageSectionData]);

  /**
   * See if user is pasting image data.
   */
  function onPaste(e) {
    // handle pasting image data
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        onUploadFile(file);
        e.preventDefault();
      }
    }
  }

  if (!canEdit) {
    // non-editable version of page section
    return (
      <div
        className={`PageSection`}
        ref={sectionRef}
      >
        {sectionTitle}
        <PageSectionImage pageSectionData={pageSectionData}/>
        {sectionText}
        <Extras extras={pageSectionData.Extras}/>
      </div>
    );
  } else {
    // editable version of page section
    return (<Suspense>
      <div
        className={`PageSection`}
        onMouseOver={() => {
          if (!editing && supportsHover) editButtonRef.current.hidden = false;
        }}
        onMouseLeave={() => {
          if (!editing && supportsHover) editButtonRef.current.hidden = true;
        }}
        onPaste={(e) => {
          if (canEdit) {
            onPaste(e)
          }
        }}
        style={{
          position: 'relative',
        }}
        data-testid={`PageSection-${pageSectionData.PageSectionID}`}
        ref={sectionRef}
      >
        <div
          className={'Editor EmptyElement'}
          hidden={
            editing
            || pageSectionData.SectionImage
            || pageSectionData.SectionTitle
            || pageSectionData.SectionText
          }
        >
          (No Content)
        </div>
        <EditableField
          field={sectionTitle}
          fieldRef={sectionTitleRef}
          api={setTitleApi}
          textContent={pageSectionData.SectionTitle}
          textAlign={pageSectionData.TitleAlign}
          callback={onTitleChanged}
          onCancel={onEditCanceled}
          canEdit={canEdit}
        />
        <PageSectionImage
          pageSectionData={pageSectionData}
          imageRef={sectionImageRef}
          dropRef={dropRef}
          onFileSelected={onUploadFile}
          canEdit={canEdit}
        />
        <EditableField
          field={sectionText}
          fieldRef={sectionTextRef}
          api={setTextApi}
          textContent={pageSectionData.SectionText}
          textAlign={pageSectionData.TextAlign}
          callback={onTextChanged}
          onCancel={onEditCanceled}
          allowEnterKey={true}
          canEdit={canEdit}
        />
        {!pageSectionData.SectionImage && (
          <FileDropTarget
            ref={dropRef}
            onFileSelected={onUploadFile}
            onError={(err) => {
              showErrorAlert(err);
              dropRef.current.setDropState(DropState.HIDDEN);
            }}
          />
        )}
        <EditSectionMenu
          pageSectionData={pageSectionData}
          editButtonRef={editButtonRef}
          titleApi={titleApi}
          textApi={textApi}
          setEditing={setEditing}
          onTextChanged={onTextChanged}
          dropRef={dropRef}
        />
      </div>
      <Extras extras={pageSectionData.Extras}/>
    </Suspense>);
  }
}