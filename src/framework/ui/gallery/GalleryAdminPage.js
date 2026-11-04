import {useLocation} from "react-router";
import {lazy, Suspense, useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";
import {Resource, Permission} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import RestrictedContent from "../../auth/RestrictedContent";

const GalleryPanel = lazy(() => import("./GalleryPanel"));
const GalleryList = lazy(() => import("./GalleryList"));

export default function GuestBookAdminPage() {

  const location = useLocation();
  const {siteData} = useSiteContext();
  const {hasPermission} = useAuth();

  const [galleryId, setGalleryId] = useState(0);
  const canView = hasPermission(Resource.GALLERY, Permission.ADD);

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.has('galleryId')) {
      setGalleryId(parseInt(params.get('galleryId')));
    }
  }, [location, setGalleryId]);

  return <>{canView ? <div className={'PageSection'}>
      <h1>Manage Photo Galler{galleryId ? 'y' : 'ies'}</h1>
      {galleryId ?
        <Suspense><GalleryPanel galleryId={galleryId}/></Suspense>
        :
        <Suspense><GalleryList siteId={siteData?.SiteID}/></Suspense>
      }
    </div>
    :
    <RestrictedContent/>
  }</>;
}