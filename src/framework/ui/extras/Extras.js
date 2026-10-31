import GuestBook from "../guestbook/GuestBook";
import Gallery from "../gallery/Gallery";
import React, {createContext, useContext, useEffect, useState} from "react";
import FileExtra from "./file/FileExtra";
import YouTubeExtra from "./youtube/YouTubeExtra";
import InstagramExtra from "./instagram/InstagramExtra";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import SmsSignup from "../sms/SmsSignup";
import LivestreamPanel from "./livestream/LivestreamPanel";
import "./Extras.css";
import {useSiteContext} from "../content/Site";

const ExtrasContext = createContext({});

/**
 * Display any extras.
 *
 * @param {[ExtraData]} extras
 *
 * @constructor
 */
export default function Extras({extras}) {

  // imports
  const {hasPermission} = useAuth();
  const {Extras} = useRestApi();
  const {moveExtraUp, moveExtraDown, removeExtraFromPage} = usePageContext();
  const {showErrorAlert} = useSiteContext();

  // states
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);


  function handleMoveUp(extraData) {
    Extras.moveUp(extraData.ExtraID)
      .then(() => {
        console.debug(`Extra ${extraData.ExtraID} moved up.`);
      }).catch((err) => showErrorAlert(err));
    moveExtraUp(extraData);
  }

  function handleMoveDown(extraData) {
    Extras.moveDown(extraData.ExtraID)
      .then(() => {
        console.debug(`Extra ${extraData.ExtraID} moved down.`);
      }).catch((err) => showErrorAlert(err));
    moveExtraDown(extraData);
  }

  function handleDelete(extraData) {
    Extras.deleteExtra(extraData.ExtraID)
      .then(() => {
        removeExtraFromPage(extraData.ExtraID);
      }).catch((err) => showErrorAlert(err));
  }

  return (<ExtrasContext value={{
    moveExtraUp: handleMoveUp,
    moveExtraDown: handleMoveDown,
  }}>
    <div className="Extras">
      <div className="ExtrasRow m-0 justify-content-start align-items-start d-flex flex-column w-100">
        {extras?.map((extra) => (<React.Fragment key={extra.ExtraID + '_' + extra.Modified}>
            {extra.ExtraType === 'guestbook' && (
              <GuestBook
                guestBookId={extra.GuestBookID}
                extraData={extra}
                sectionExtras={extras}
                extraId={extra.ExtraID}
              />
            )}
            {extra.ExtraType === 'gallery' && (
              <Gallery galleryId={extra.GalleryID} extraData={extra} sectionExtras={extras} extraId={extra.ExtraID}/>
            )}
            {extra.ExtraType === 'sms' && (
              <SmsSignup
                smsCampaignId={extra.SMSCampaignID}
                menuItems={[{label: `Remove from Page`, action: () => handleDelete(extra)}]}
              />
            )}
            {extra.ExtraType === 'instagram' && (
              <InstagramExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            )}
            {extra.ExtraType === 'file' && (
              <FileExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            )}
            {extra.ExtraType === 'youtube' && (
              <YouTubeExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            )}
            {extra.ExtraType === 'livestream' && (
              <LivestreamPanel
                livestreamId={extra.LivestreamID}
                menuItems={[{label: `Remove from Page`, action: () => handleDelete(extra)}]}
              />
            )}
          </React.Fragment>)
        )
        }
      </div>
    </div>
  </ExtrasContext>)
}

export const useExtrasContext = () => useContext(ExtrasContext);