import React, {createContext, lazy, Suspense, useContext, useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {useRestApi} from "../../api/RestApi";
import {usePageContext} from "../content/Page";
import "./Extras.css";
import {useSiteContext} from "../content/Site";

const ExtrasContext = createContext({});
const SmsSignup = lazy(() => import("../sms/SmsSignup"));
const GalleryPanel = lazy(() => import("../gallery/GalleryPanel"));
const LivestreamPanel = lazy(() => import("../livestream/LivestreamPanel"));
const FileExtra = lazy(() => import("./file/FileExtra"));
const YouTubeExtra = lazy(() => import("./youtube/YouTubeExtra"));
const InstagramExtra = lazy(() => import("./instagram/InstagramExtra"));
const GuestBook = lazy(() => import("../guestbook/GuestBook"));

/**
 * Display any extras.
 *
 * @param {[ExtraData]} extras
 *
 * @constructor
 */
export default function Extras({extras}) {

  const {hasPermission} = useAuth();
  const {Extras} = useRestApi();
  const {moveExtraUp, moveExtraDown, removeExtraFromPage} = usePageContext();
  const {showErrorAlert} = useSiteContext();

  const canEdit= hasPermission?.(Resource.PAGE, Permission.EDIT);

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

  // build admin menu for panels
  const menuItemList = canEdit && extras?.map((item, index, array) => {
    let menuItems = [{label: `Remove from Page`, action: () => handleDelete(item)}];
    if (index > 0) {
      menuItems.push({label: `Move Up`, action: () => moveExtraUp(item)})
    }
    if (index < array.length - 1) {
      menuItems.push({label: `Move Down`, action: () => moveExtraDown(item)})
    }
    return menuItems;
  })

  return (<ExtrasContext value={{
    moveExtraUp: handleMoveUp,
    moveExtraDown: handleMoveDown,
  }}>
    <div className="Extras">
      <div className="ExtrasRow m-0 justify-content-start align-items-start d-flex flex-column w-100">
        {extras?.map((extra, index) => (<React.Fragment key={extra.ExtraID + '_' + extra.Modified}>
            {extra.ExtraType === 'guestbook' && <Suspense>
              <GuestBook
                guestBookId={extra.GuestBookID}
                extraData={extra}
                sectionExtras={extras}
                extraId={extra.ExtraID}
                menuItems={menuItemList[index]}
              />
            </Suspense>}
            {extra.ExtraType === 'gallery' && <Suspense>
              <GalleryPanel
                galleryId={extra.GalleryID}
                onDelete={() => handleDelete(extra)}
                menuItems={menuItemList[index]}
              />
            </Suspense>}
            {extra.ExtraType === 'sms' && <Suspense>
              <SmsSignup
                smsCampaignId={extra.SMSCampaignID}
                onDelete={() => handleDelete(extra)}
                menuItems={menuItemList[index]}
              />
            </Suspense>}
            {extra.ExtraType === 'instagram' && <Suspense>
              <InstagramExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            </Suspense>}
            {extra.ExtraType === 'file' && <Suspense>
              <FileExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            </Suspense>}
            {extra.ExtraType === 'youtube' && <Suspense>
              <YouTubeExtra extraData={extra} sectionExtras={extras} canEdit={canEdit}/>
            </Suspense>}
            {extra.ExtraType === 'livestream' && <Suspense>
              <LivestreamPanel
                livestreamId={extra.LivestreamID}
                menuItems={menuItemList[index]}
              />
            </Suspense>}
          </React.Fragment>)
        )
        }
      </div>
    </div>
  </ExtrasContext>)
}

export const useExtrasContext = () => useContext(ExtrasContext);