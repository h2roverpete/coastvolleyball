import PageSection from './PageSection';
import React, {Fragment, useEffect, useState} from "react";
import {usePageContext} from "./Page";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {Spinner} from "react-bootstrap";

/**
 * Element to show all the sections on a page
 *
 * A <div> element with class names "content container"
 *
 * @param props {PageSectionProps}
 * @constructor
 */
export default function PageSections({children}) {

  const {pageData, sectionData} = usePageContext();
  const {hasPermission} = useAuth();

  const [canEdit, setCanEdit] = useState(false);
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

  return <>
    {pageData?.PageContent ? <>{pageData.PageContent}</> : <>
      {sectionData !== null ? (<>
          {sectionData.map(section => (<Fragment key={section.PageSectionID + "_" + section.Modified}>
            <PageSection
              pageSectionData={section}
              data-testid={`PageSection-section.PageSectionID`}
              canEdit={canEdit}
            />
          </Fragment>))}
          {children}
        </>) :
        <div className="PageLoading">
          <Spinner/>
        </div>}
    </>}
  </>
}