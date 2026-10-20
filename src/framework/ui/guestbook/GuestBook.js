import {useEffect, useState, memo, useContext, createContext, useRef, Suspense, lazy} from "react";
import '../forms/Forms.css'
import {useRestApi} from "../../api/RestApi";
import {Button} from "react-bootstrap";
import {isValidEmail} from "../../util/Validators";
import {useTouchContext} from "../../util/TouchProvider";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {useSiteContext} from "../content/Site";
import './Guestbook.css';

const GuestFields = lazy(()=>import("./GuestFields"));
const GuestFeedbackFields = lazy(()=>import("./GuestFeedbackFields"));
const GuestBookConfigPanel = lazy(() => import("./GuestBookConfigPanel"));
const FormEditor = lazy(() => import("../editor/FormEditor"));
const MoveExtraMenu = lazy(() => import("../extras/MoveExtraMenu"));

export const GuestBookContext = createContext({
  guestBookConfig: null
});

export function useGuestBook() {
  return useContext(GuestBookContext);
}

/**
 * @callback DataChange
 * @param {String} name
 * @param {any} value
 */


/**
 * @callback DataChangedCallback
 * @param {DataChange} changeInfo
 */

/**
 * Guest Book component
 * @property {number} guestBookId         Guest book ID.
 * @returns {JSX.Element}
 * @constructor
 */
function GuestBook({guestBookId, extraData, sectionExtras}) {

  // imports
  const {GuestBooks} = useRestApi();
  const {hasPermission} = useAuth();
  const {supportsHover} = useTouchContext();
  const {showErrorAlert} = useSiteContext();
  const [guestData, setGuestData] = useState(/** @type FormDataAPI<GuestData> */null)
  const [feedbackData, setFeedbackData] = useState(/** @type FormDataAPI<GuestFeedbackData> */null)

  // states
  const [guestBookConfig, setGuestBookConfig] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // refs
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.GUESTBOOK, Permission.ADMIN));
  }, [setCanEdit, hasPermission]);

  // load guest book configuration when initialized
  useEffect(() => {
    if (!guestBookConfig && guestBookId) {
      console.debug(`Loading guest book configuration...`)
      GuestBooks.getGuestBook(guestBookId).then(data => {
        if (!data.LabelCols) {
          data.LabelCols = 2;
        }
        console.debug(`Guest book configuration loaded.`);
        setGuestBookConfig(data);
      }).catch(error => {
        showErrorAlert(`Error loading guest book.`, error);
      });
    }
  }, [GuestBooks, guestBookId, guestBookConfig, showErrorAlert]);

  /**
   * Handle form submit.
   * @param e
   */
  function handleSubmit(e) {
    e.preventDefault();
    console.debug(`Updating guest. data=${JSON.stringify(guestData.edits)}`);
    GuestBooks.insertOrUpdateGuest(guestBookId, {GuestBookID: guestBookConfig.GuestBookID, ...guestData.edits}).then(data => {
      setSubmitted(true);
      guestData.update(data);
      GuestBooks.insertOrUpdateGuestFeedback(data.GuestID, {GuestID: data.GuestID, ...feedbackData.edits}).then(data => {
        feedbackData.update(data);
      }).catch(error => {
        showErrorAlert(`Error updating guest feedback. `, error);
      })
    }).catch(error => {
      showErrorAlert(`Error updating guest. `, error);
    })
  }

  function isDataValid() {
    return (
      guestData &&
      guestData.edits?.FirstName?.length > 0 &&
      guestData.edits?.LastName?.length > 0 &&
      isValidEmail(guestData.edits?.Email) &&
      (guestBookConfig?.ShowLodgingFields ?
          guestData.edits?.ArrivalDate?.length > 0 &&
          guestData.edits?.DepartureDate?.length > 0 &&
          guestData.edits?.NumberOfGuests?.length > 0 :
          true
      ) &&
      areCustomFieldsValid()
    )
  }

  function areCustomFieldsValid() {
    for (let i = 1; i <= 8; i++) {
      if (guestBookConfig?.[`Custom${i}Type`]?.length > 0
        && guestBookConfig?.[`Custom${i}Required`] === true
        && !guestData.edits?.[`Custom${i}`]?.length
      ) {
        return false;
      }
    }
    return true;
  }

  return (
    <GuestBookContext value={
      {
        guestBookConfig: guestBookConfig,
        setGuestBookConfig: setGuestBookConfig,
      }
    }>
      {guestBookConfig !== null && <div
        className="GuestBook"
        style={{width: '100%', position: 'relative'}}
        onMouseOver={() => {
          if (supportsHover && canEdit) {
            buttonRef.current.hidden = false;
            if (menuRef.current) {
              menuRef.current.hidden = false;
            }
          }
        }}
        onMouseOut={() => {
          if (supportsHover && canEdit) {
            buttonRef.current.hidden = true;
            if (menuRef.current) {
              menuRef.current.hidden = true;
            }
          }
        }}
      >
        {submitted ? (
          <>
            <p
              dangerouslySetInnerHTML={{__html: guestBookConfig.DoneMessage ? guestBookConfig.DoneMessage : 'Your information has been submitted.'}}/>
            <Button
              variant="primary"
              onClick={() => {
                // clear submit flag and feedback ID to submit again
                setSubmitted(false);
              }}>
              {guestBookConfig.AgainMessage ? guestBookConfig.AgainMessage : 'Submit Again'}
            </Button>
          </>
        ) : (
          <Suspense>
            <p
              dangerouslySetInnerHTML={{__html: guestBookConfig.GuestBookMessage ? guestBookConfig.GuestBookMessage : 'Please enter your information below.'}}/>
            <FormEditor apiRef={setGuestData}>
              <GuestFields
                guestBookConfig={guestBookConfig}
                labelCols={guestBookConfig.LabelCols}
              />
            </FormEditor>
            <FormEditor apiRef={setFeedbackData}>
              <GuestFeedbackFields
                guestBookConfig={guestBookConfig}
                labelCols={guestBookConfig.LabelCols}
              />
            </FormEditor>
            <div className="form-errors" id="FormErrors"></div>
            <div className="form-group mt-4">
              <Button
                variant={'primary'}
                disabled={!isDataValid()}
                onClick={(e) => handleSubmit(e)}
              >
                {guestBookConfig.SubmitButtonName ? guestBookConfig.SubmitButtonName : 'Submit'}
              </Button>
            </div>
          </Suspense>
        )}
        {canEdit && (<Suspense>
          <FormEditor>
            <GuestBookConfigPanel extraId={extraData.ExtraID} buttonRef={buttonRef}/>
          </FormEditor>
          <MoveExtraMenu extraData={extraData} sectionExtras={sectionExtras} buttonRef={menuRef}/>
        </Suspense>)}
      </div>}
    </GuestBookContext>
  )
}

// memorize guest book state between content changes
export default memo(GuestBook);
