import {BsPersonCircle} from "react-icons/bs";
import React, {useEffect, useState} from "react";
import {useAuth} from "../../auth/AuthProvider";
import {useNavigate} from "react-router";
import {Nav} from "react-bootstrap";
import {Resource, Permission} from "../../auth/Permissions";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "./Site";

export default function UserMenu({buttonRef, onClose}) {

  const {isAuthenticated, currentUser} = useAuth();
  const navigate = useNavigate();
  const {siteData, showErrorAlert} = useSiteContext();
  const [campaigns, setCampaigns] = useState(/** @type {[SMSCampaignData]} */ null);
  const [galleries, setGalleries] = useState(/** @type {[GalleryData]} */ null);
  const [livestreams, setLivestreams] = useState(/** @type {[LivestreamData]} */ null);
  const [guestBooks, setGuestBooks] = useState(/** @type {[GuestBookConfig]} */ null);
  const {SMS, Galleries, Livestreams, GuestBooks} = useRestApi();
  const {hasPermission} = useAuth();

  const hasSmsPermission = hasPermission(Resource.SMS, Permission.SEND);
  const hasUserPermission = hasPermission(Resource.USERS, Permission.ADMIN);
  const hasGalleryPermission = hasPermission(Resource.GALLERY, Permission.ADD);
  const hasLivestreamPermission = hasPermission(Resource.LIVESTREAM, Permission.BROADCAST);
  const hasGuestBookPermission = hasPermission(Resource.GUESTBOOK, Permission.ADMIN);

  useEffect(() => {
    if (siteData && hasSmsPermission && !campaigns) {
      SMS.getSmsCampaignsForSite(siteData.SiteID).then((response) => {
        setCampaigns(response);
      }).catch((err) => {
        showErrorAlert(`Error getting messaging campaign list.`, err);
      })
    }
  }, [siteData, campaigns, setCampaigns, hasPermission, hasSmsPermission, SMS, showErrorAlert]);

  useEffect(() => {
    if (siteData && hasGalleryPermission && !galleries) {
      Galleries.getGalleriesForSite(siteData.SiteID).then((response) => {
        setGalleries(response);
      }).catch((err) => {
        showErrorAlert(`Error getting gallery list.`, err);
      })
    }
  }, [siteData, galleries, setGalleries, hasGalleryPermission, Galleries, showErrorAlert]);

  useEffect(() => {
    if (siteData && hasLivestreamPermission && !livestreams) {
      Livestreams.getLivestreamsForSite(siteData.SiteID).then((response) => {
        setLivestreams(response);
      }).catch((err) => {
        showErrorAlert(`Error getting livestream list.`, err);
      })
    }
  }, [siteData, livestreams, Livestreams, hasLivestreamPermission, setLivestreams, showErrorAlert]);

  useEffect(() => {
    if (siteData && hasGuestBookPermission && !guestBooks) {
      GuestBooks.getGuestBooksForSite(siteData.SiteID).then((response) => {
        setGuestBooks(response);
      }).catch((err) => {
        showErrorAlert(`Error getting guest book list.`, err);
      })
    }
  }, [siteData, guestBooks, GuestBooks, hasGuestBookPermission, setGuestBooks, showErrorAlert]);

  return (<>
    <div
      className="UserMenu button-group navbar-nav"
      ref={buttonRef}
    >
      <Nav.Link
        className={`NavLink d-flex align-items-center`}
        data-bs-toggle="dropdown"
      >
        <div className={`pe-2`}>{currentUser?.UserName}</div>
        <BsPersonCircle size="20"/>
      </Nav.Link>
      <div className="dropdown-menu dropdown-menu-end" style={{cursor: 'pointer', zIndex: 100}}>
        {isAuthenticated && (
          <span className="dropdown-item" onClick={() => {
            navigate('/admin/user');
            onClose?.();
          }}>User Profile</span>
        )}
        {hasGalleryPermission && galleries?.length > 0 && <>
          {galleries.length === 1 ?
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/galleries?galleryId=${galleries[0].GalleryID}`);
                onClose?.();
              }}>Manage Photo Gallery</span>
            </div>
            :
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/galleries`);
                onClose?.();
              }}>Manage Photo Galleries</span>
            </div>
          }
        </>}
        {hasSmsPermission && campaigns?.length > 0 && <>
          {campaigns.length === 1 ?
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/sms?campaignId=${campaigns[0].SMSCampaignID}`);
                onClose?.();
              }}>Manage Messaging</span>
            </div>
            :
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/sms`);
                onClose?.();
              }}>Manage Messaging</span>
            </div>
          }
        </>}
        {hasLivestreamPermission && livestreams?.length > 0 && <>
          {livestreams.length === 1 ?
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/livestreams?livestreamId=${livestreams[0].LivestreamID}`);
                onClose?.();
              }}>Manage Livestream</span>
            </div>
            :
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/livestreams`);
                onClose?.();
              }}>Manage Livestreams</span>
            </div>
          }
        </>}
        {hasGuestBookPermission && guestBooks?.length > 0 && <>
          {guestBooks.length === 1 ?
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/guestbooks?guestBookId=${guestBooks[0].GuestBookID}`);
                onClose?.();
              }}>Manage Guest Book</span>
            </div>
            :
            <div>
              <span className="dropdown-item" onClick={() => {
                navigate(`/admin/guestbooks`);
                onClose?.();
              }}>Manage Guest Books</span>
            </div>
          }
        </>}
        {hasUserPermission &&
          <span className="dropdown-item" onClick={() => {
            navigate(`/admin/users`);
            onClose?.();
          }}>
            Manage Users
          </span>
        }
        {!isAuthenticated && (
          <span className="dropdown-item" onClick={() => {
            navigate('/login');
            onClose?.();
          }}>Log In</span>
        )}
        {isAuthenticated && (
          <span className="dropdown-item" onClick={() => {
            navigate('/logout');
            onClose?.();
          }}>Log Out</span>
        )}
      </div>
    </div>
  </>);
}