import {useEffect, useState, memo, useContext, createContext, useRef} from "react";
import GuestFields from "./GuestFields";
import GuestFeedbackFields from "./GuestFeedbackFields";
import '../forms/Forms.css'
import {useRestApi} from "../../api/RestApi";
import {Button} from "react-bootstrap";
import GuestBookConfigPanel from "./GuestBookConfigPanel";
import {isValidEmail} from "../../util/Validators";
import FormEditor from "../editor/FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import MoveExtraMenu from "../extras/MoveExtraMenu";
import {useSiteContext} from "../content/Site";

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
 * @property {number} guestId             Guest ID to populate fields with.
 * @property {number} guestFeedbackId     Guest Feedback ID to populate fields with.
 * @property {DataCallback} [onChange]    Receives notification that guest ID or guest feedback ID was updated
 * @returns {JSX.Element}
 * @constructor
 */
function GuestBook({guestBookId, extraData, sectionExtras, guestId, guestFeedbackId, onChange}) {

  // imports
  const {GuestBooks} = useRestApi();
  const {hasPermission} = useAuth();
  const {supportsHover} = useTouchContext();
  const {showErrorAlert} = useSiteContext();

  // states
  const [guestBookConfig, setGuestBookConfig] = useState(null);
  const [guestData, setGuestData] = useState({});
  const [guestFeedbackData, setGuestFeedbackData] = useState({});
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

  useEffect(() => {
    if (!guestData && guestId) {
      console.debug(`Loading guest data...`);
      GuestBooks.getGuest(guestId).then(data => {
        setGuestData(prevData => {
          return {
            ...prevData,
            ...data
          }
        });
        console.debug(`Guest data loaded.`)
      }).catch(error => {
        showErrorAlert(`Error getting guest data`, error);
      });
    }
  }, [GuestBooks, guestId, guestBookId, guestData, showErrorAlert])

  useEffect(() => {
    if (!guestFeedbackData && guestFeedbackId) {
      console.debug(`Loading guest feedback...`);
      GuestBooks.getGuestFeedback(guestFeedbackId).then(data => {
        setGuestFeedbackData(prevData => {
          return {
            ...prevData,
            ...data
          }
        });
        console.debug(`Guest feedback loaded.`)
      }).catch(error => {
        showErrorAlert(`Error getting feedback`, error);
      });
    }
  }, [GuestBooks, guestFeedbackId, guestFeedbackData, showErrorAlert])

  /**
   * Handle changes in response to data entry.
   *
   * @param name String
   * @param value String
   */
  function handleGuestChange({name, value}) {
    setGuestData((prevValue) => {
      const newValue = {
        ...prevValue,
        [name]: value
      }
      console.debug(`Guest data updated: ${JSON.stringify(newValue)}`);
      return newValue;
    });
  }

  /**
   * Handle changes in response to data entry.
   *
   * @param name String
   * @param value String
   */
  function handleFeedbackChange({name, value}) {
    setGuestFeedbackData((prevValue) => {
      const newValue = {
        ...prevValue,
        [name]: value
      }
      if (typeof value === 'string' && value.trim().length === 0) {
        // remove empty string properties
        delete newValue[name];
      }
      console.debug(`Feedback data updated: ${JSON.stringify(newValue)}`);
      return newValue;
    });
  }

  /**
   * Handle form submit.
   * @param e
   */
  function handleSubmit(e) {
    e.preventDefault();
    console.debug(`Updating guest. data=${JSON.stringify(guestData)}`);
    GuestBooks.insertOrUpdateGuest(guestBookId, guestData).then(data => {
      console.debug(`Guest update result: ${JSON.stringify(data)}`);
      setSubmitted(true);
      setGuestData(data);
      GuestBooks.insertOrUpdateGuestFeedback(data.GuestID, guestFeedbackData).then(data => {
        console.debug(`Guest feedback update result: ${JSON.stringify(data)}`);
      })
    })
  }

  function isDataValid() {
    return (
      guestData?.FirstName?.length > 0 &&
      guestData?.LastName?.length > 0 &&
      (guestData?.Email?.length > 0 && isValidEmail(guestData?.Email)) &&
      (guestBookConfig?.ShowLodgingFields ?
          guestFeedbackData?.ArrivalDate?.length > 0 &&
          guestFeedbackData?.DepartureDate?.length > 0 &&
          guestFeedbackData?.NumberOfGuests?.length > 0 :
          true
      ) &&
      areCustomFieldsValid()
    )
  }

  function areCustomFieldsValid() {
    for (let i = 1; i <= 8; i++) {
      if (guestBookConfig?.[`Custom${i}Type`]?.length > 0
        && guestBookConfig?.[`Custom${i}Required`] === true
        && !guestFeedbackData?.[`Custom${i}`]?.length
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
      {guestBookConfig && (<div
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
                onChange?.({guestFeedbackId: 0});
              }}>
              {guestBookConfig.AgainMessage ? guestBookConfig.AgainMessage : 'Submit Again'}
            </Button>
          </>
        ) : (
          <>
            <p
              dangerouslySetInnerHTML={{__html: guestBookConfig.GuestBookMessage ? guestBookConfig.GuestBookMessage : 'Please enter your information below.'}}/>
            <form
              encType="multipart/form-data"
              className="needs-validation"
              id="GuestBookForm"
            >
              <GuestFields
                guestBookConfig={guestBookConfig}
                guestData={guestData}
                onChange={handleGuestChange}
                labelCols={guestBookConfig.LabelCols}
              />
              <GuestFeedbackFields
                guestBookConfig={guestBookConfig}
                guestFeedbackData={guestFeedbackData}
                onChange={handleFeedbackChange}
                labelCols={guestBookConfig.LabelCols}
              />
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
            </form>
          </>
        )}
        {canEdit && (<>
          <FormEditor>
            <GuestBookConfigPanel extraId={extraData.ExtraID} buttonRef={buttonRef}/>
          </FormEditor>
          <MoveExtraMenu extraData={extraData} sectionExtras={sectionExtras} buttonRef={menuRef}/>
        </>)}
      </div>)}
    </GuestBookContext>
  )
}

// memorize guest book state between content changes
export default memo(GuestBook);
