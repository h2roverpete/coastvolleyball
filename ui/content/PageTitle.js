import {usePageContext} from "./Page";
import {lazy, Suspense, useEffect, useRef, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "./Site";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";

const EditableField = lazy(() => import("../editor/EditableField"));

/**
 * Display the page title in an <h1> tag.
 *
 * If the page title has not loaded yet, still displays the
 * tag and reserves its space in the layout.
 *
 * Must be located within the <Page> tag to receive context.
 *
 * @param text {string} Explicit text for title.
 * @param alwaysShow {Boolean} Always show <h1> element, even when text is empty.
 * @returns {JSX.Element}f
 * @constructor
 */
export default function PageTitle({text, alwaysShow}) {

  const {pageData} = usePageContext();
  const {Outline} = useSiteContext();
  const {Pages} = useRestApi();
  const {hasPermission} = useAuth();

  const [titleText, setTitleText] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (text) {
      setTitleText(text);
    } else if (pageData?.PageTitle) {
      setTitleText(pageData.PageTitle);
    }
  }, [pageData, setTitleText, text]);

  function onTitleChanged({textContent, textAlign}) {
    if (pageData) {
      console.debug(`Updating page title: textContent=${textContent}, textAlign=${textAlign}`);
      pageData.PageTitle = textContent;
      pageData.PageTitleAlign = textAlign;
      Pages.insertOrUpdatePage(pageData)
        .then((result) => {
          console.debug(`Page title updated.`);
          // refresh outline with new title
          Outline.updatePage(result);
        })
        .catch((err) => {
          console.error(`Error updating page title: ${err.message}`);
        })
    }
  }

  const titleRef = useRef(null);
  const title = (
    <h1
      className={`PageTitle`}
      style={{
        width: '100%',
        textAlign: pageData?.PageTitleAlign,
      }}
      data-testid="PageTitle"
      ref={titleRef}
    >
      {titleText ? titleText : (<>&nbsp;</>)}
    </h1>
  )

  return (<>
    {canEdit ? <Suspense>
      <EditableField
        field={title}
        fieldRef={titleRef}
        callback={onTitleChanged}
        textContent={titleText}
        textAlign={pageData?.PageTitleAlign}
        showEditButton={true}
        editTooltip={'Edit page title'}
        alwaysShow={alwaysShow === true}
        canEdit={canEdit}
      />
    </Suspense> : (<>{title}</>)
    }
  </>)
}