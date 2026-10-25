import PageSection from './PageSection';
import React, {Fragment, useEffect, useState} from "react";
import {usePageContext} from "./Page";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {Button, Spinner} from "react-bootstrap";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "./Site";

/**
 * Element to show all the sections on a page
 *
 * A <div> element with class names "content container"
 *
 * @param props {PageSectionProps}
 * @constructor
 */
export default function PageSections({children}) {

  const {pageData, sectionData, setSectionData} = usePageContext();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();
  const {PageSections} = useRestApi();

  const [canEdit, setCanEdit] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (canEdit) {
      // attach drag and drop related window scripts
      window.addEventListener("drop", windowDropHandler);
    }
  }, [canEdit]);

  function windowDropHandler(e) {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file" || item.type.match("^text/uri-list"))) {
      e.preventDefault();
    }
  }

  function addPageSection() {
    setBusy(true);
    PageSections.insertOrUpdatePageSection({
      PageID: pageData.PageID,
      PageSectionSeq: 1,
    }).then((newSection) => {
      setSectionData([newSection]);
      setBusy(false);
    }).catch(error => {
      showErrorAlert(`Error adding section.`, error);
      setBusy(false);
    });
  }

  return <>
    {pageData?.PageContent ? <>{pageData.PageContent}</> : <>
      {sectionData !== null ? (<>
          {sectionData.length > 0 ? <>
            {sectionData.map(section => (<Fragment key={section.PageSectionID + "_" + section.Modified}>
              <PageSection
                pageSectionData={section}
                data-testid={`PageSection-section.PageSectionID`}
                canEdit={canEdit}
              />
            </Fragment>))}
          </> : <>
            {canEdit &&
              <Button
                className={'mt-3'}
                style={{width: "200px"}}
                onClick={addPageSection}
              >
                {busy ? <Spinner size={"sm"}></Spinner> : <>Add Page Section</> }
              </Button>
            }
          </>}
          {children}
        </>) :
        <div className="PageLoading">
          <Spinner/>
        </div>}
    </>}
  </>
}