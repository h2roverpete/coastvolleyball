import React, {Suspense, useEffect, useMemo, useRef, useState} from "react";
import "react-image-gallery/styles/image-gallery.css";
import {useRestApi} from "../../api/RestApi";
import './Gallery.css';
import {useSiteContext} from "../content/Site";
import {Button} from "react-bootstrap";
import {BsThreeDotsVertical} from "react-icons/bs";
import {useTouchContext} from "../../util/TouchProvider";
import {Permission, Resource} from "../../auth/Permissions";
import {useAuth} from "../../auth/AuthProvider";
import EditorPanel from "../editor/EditorPanel";
import FormEditor from "../editor/FormEditor";
import GalleryFields from "./GalleryFields";
import FileDropTarget, {DropState} from '../editor/FileDropTarget';
import ImageGallery from "react-image-gallery";
import DescribePhotoModal from "./DescribePhotoModal";

/**
 * Display a photo gallery
 *
 * @property {number} galleryId
 * @returns {JSX.Element}
 * @constructor
 */
export default function GalleryPanel({galleryId, galleryData, onUpdate, onDelete, menuItems}) {

  // imports
  const {Galleries, Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {supportsHover} = useTouchContext();
  const {hasPermission} = useAuth();

  // states
  const [galleryConfig, setGalleryConfig] = useState(/** @type {GalleryData}*/null);
  const [galleryPhotos, setGalleryPhotos] = useState(/**@type [{PhotoData}]*/ null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [gallerySite, setGallerySite] = useState(null);

  const [canEdit, setCanEdit] = useState(false);
  const [canAddPhotos, setCanAddPhotos] = useState(false);
  const [canAdmin, setCanAdmin] = useState(false);
  const [showDescribePhotoModal, setShowDescribePhotoModal] = useState(false);

  // refs
  const fileDropRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.GALLERY, Permission.EDIT));
    setCanAddPhotos(hasPermission?.(Resource.GALLERY, Permission.ADD));
    setCanAdmin(hasPermission?.(Resource.GALLERY, Permission.ADMIN));
  }, [setCanEdit, setCanAddPhotos, setCanAdmin, hasPermission]);

  useEffect(() => {
    if (galleryData) {
      setGalleryConfig(galleryData);
      Sites.getSite(galleryData.SiteID).then(site => {
        setGallerySite(site);
      }).catch(error => showErrorAlert(error));
    } else if (galleryId) {
      Galleries.getGallery(galleryId).then((data) => {
        console.debug(`Loaded gallery ${galleryId}.`);
        setGalleryConfig(data);
        Sites.getSite(data.SiteID).then(site => {
          setGallerySite(site);
        }).catch(error => showErrorAlert(error));
      }).catch(error => {
        showErrorAlert(`Error loading gallery ${galleryId}: ${error}`);
      })
    }
  }, [galleryId, Sites, galleryData, setGalleryConfig, showErrorAlert, Galleries]);

  useEffect(() => {
    if (galleryConfig && !galleryPhotos) {
      Galleries.getPhotos(galleryConfig.GalleryID).then((data) => {
        console.debug(`Loaded ${data.length} photos for gallery ${galleryId}.`);
        if (galleryConfig?.RandomizeOrder) {
          data.sort(() => Math.random() - 0.5);
        }
        if (data.length > 0) {
          setCurrentPhoto(data[0]);
        }
        setGalleryPhotos(data);
      }).catch(error => {
        showErrorAlert(`Error loading photos for gallery ${galleryId}: ${error}`);
      })
    }
  }, [galleryConfig, galleryId, showErrorAlert, Galleries, galleryPhotos]);

  function updateCurrentPhoto(data) {
    setGalleryPhotos(
      galleryPhotos.map((photo) => {
        if (photo.PhotoID === data.PhotoID) {
          return {...data};
        } else {
          return photo;
        }
      })
    );
    setCurrentPhoto({...data});
  }

  function uploadFile(file) {
    console.debug(`Uploading photo...`);
    fileDropRef.current?.setDropState(DropState.UPLOADING);
    Galleries.uploadPhoto(gallerySite.SiteID, galleryConfig.GalleryID, file)
      .then((result) => {
        console.debug(`Photo uploaded successfully.`);
        fileDropRef.current?.setDropState(DropState.HIDDEN);
        setGalleryPhotos(galleryPhotos => [...galleryPhotos, result]);
        if (!currentPhoto) {
          setCurrentPhoto(result);
        }
      })
      .catch(e => {
        fileDropRef.current?.setDropState(DropState.HIDDEN);
        showErrorAlert(`Error uploading photo.`, e);
      });
  }

  function uploadFiles(files) {
    fileDropRef.current?.setDropState(DropState.UPLOADING_MULTIPLE);
    const progress = {
      min: 0,
      max: files.length,
      now: 1
    };
    console.debug(`Uploading ${files.length} photos...`);
    fileDropRef.current?.setProgress(progress);
    const promises = [];
    for (const file of files) {
      promises.push(
        new Promise((resolve, reject) => {
            Galleries.uploadPhoto(gallerySite.SiteID, galleryConfig.GalleryID, file)
              .then((result) => {
                console.debug(`Photo uploaded successfully.`);
                progress.now++;
                fileDropRef.current?.setProgress({...progress});
                resolve(result);
              }).catch(reject);
          }
        )
      )
    }
    runSequentialFunctions(promises).then((newPhotos) => {
      setGalleryPhotos([...galleryPhotos, ...newPhotos]);
      fileDropRef.current?.setDropState(DropState.HIDDEN);
    }).catch(e => showErrorAlert(`Error uploading photos.`, e));
  }

  function onDropError(error) {
    fileDropRef.current?.setDropState(DropState.HIDDEN);
    showErrorAlert(error);
  }

  const images = useMemo(() => {
    if (galleryPhotos?.length > 0 && gallerySite) {
      // build list of images for gallery
      console.debug(`Build list of images for gallery control...`);
      const list = [];
      for (const photo of galleryPhotos) {
        if (photo.PhotoFile && gallerySite) {
          // new format upload
          list.push({
            original: `${gallerySite.SiteRootUrl}/${photo.PhotoFile}`,
            thumbnail: `${gallerySite.SiteRootUrl}/${photo.PhotoFile}`,
          })
        } else if (photo.PhotoSmall && photo.PhotoLarge) {
          list.push({
            original: `${gallerySite.SiteRootUrl}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoLarge}`,
            thumbnail: `${gallerySite.SiteRootUrl}/images/gallery/${photo.SubDirectory.toString().padStart(3, '0')}/${photo.PhotoSmall}`,
          })
        }
      }
      console.debug(`Built list of ${list.length} images.`);
      return list;
    } else return [];
  }, [galleryPhotos, gallerySite]);

  useEffect(() => {
    // keep current photo in sync with gallery display
    console.debug(`Checking current photo.`);
    if (!currentPhoto && galleryPhotos?.length > 0) {
      console.debug(`Setting current photo to first.`);
      setCurrentPhoto(galleryPhotos[0]);
    } else if (currentPhoto && galleryPhotos?.length === 0) {
      console.debug(`Setting current photo to null.`);
      setCurrentPhoto(null);
    } else if (currentPhoto && galleryPhotos.length > 0) {
      const index = galleryRef.current?.getCurrentIndex();
      if (index >= 0 && currentPhoto.PhotoID !== galleryPhotos[index].PhotoID) {
        for (let i = 0; i < galleryPhotos.length; i++) {
          if (galleryPhotos[i].PhotoID === currentPhoto.PhotoID) {
            console.debug(`Sliding to current photo.`);
            galleryRef.current?.slideToIndex(i)
          }
        }
      }
    }
  }, [galleryPhotos, currentPhoto]);

  const galleryRef = useRef(null);

  function onSlide(currentIndex) {
    setCurrentPhoto(galleryPhotos[currentIndex]);
  }

  function onDeletePhoto() {
    if (currentPhoto) {
      console.debug(`Delete photo ${currentPhoto.PhotoID}`);
      Galleries.deletePhoto(galleryConfig.GalleryID, currentPhoto.PhotoID).then((result) => {
        console.debug(`Photo deleted.`);
        const newPhotos = [];
        for (const photo of galleryPhotos) {
          if (photo.PhotoID !== result.PhotoID) {
            newPhotos.push(photo);
          }
        }
        setGalleryPhotos(newPhotos);
        setCurrentPhoto(null);
      }).catch(error => showErrorAlert(`Error deleting photo.`, error));
    }
  }

  /**
   * See if user is pasting image data.
   */
  function onPaste(e) {
    console.debug(`Paste to gallery.`);
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        uploadFile(file);
        e.preventDefault();
      }
    }
  }

  function handlePhotoUpdate(newData) {
    updateCurrentPhoto(newData);
  }

  function handleUpdate(newData) {
    setGalleryConfig(newData);
    onUpdate?.(newData);
  }

  return <>
    <div
      className="Gallery"
      onDragEnter={(e) => {
        if (canAddPhotos) {
          fileDropRef.current?.onDragEnter(e, DropState.ADD);
        }
      }}
      onMouseOver={() => {
        if (canAddPhotos && supportsHover && buttonRef.current) {
          // show editor button and property panel
          buttonRef.current.hidden = false;
        }
      }}
      onMouseOut={() => {
        if (canAddPhotos && supportsHover && buttonRef.current) {
          // hide editor button and property panel
          buttonRef.current.hidden = true;
        }
      }}
      onPaste={(e) => {
        if (canAddPhotos) {
          onPaste(e)
        }
      }}
      onTouchMove={(e) => {
        e.stopPropagation()
      }}
    >
      {images?.length > 0 && (<Suspense>
        <ImageGallery items={images} ref={galleryRef} onSlide={onSlide}/>
      </Suspense>)}
      {canAddPhotos && (<>
        {images && images.length === 0 && (
          <div className={'Editor EmptyElement'} style={{height: '200px'}}>(Empty Gallery)</div>
        )}
        <FileDropTarget
          ref={fileDropRef}
          onFileSelected={uploadFile}
          onFilesSelected={uploadFiles}
          onError={onDropError}
          multiple={true}
        />
        <div
          className="EditGalleryPhoto Editor dropdown"
          hidden={supportsHover}
          ref={buttonRef}
        >
          <Button
            className={`EditButton`}
            type="button"
            variant="secondary"
            size={'sm'}
            aria-expanded="false"
            data-bs-toggle="dropdown"
          >
            <BsThreeDotsVertical/>
          </Button>
          <ul
            className="dropdown-menu Editor"
            style={{zIndex: 100, cursor: 'pointer'}}
          >
            {currentPhoto && canEdit && (<>
              <li>
                <button className="dropdown-item" onClick={() => setShowDescribePhotoModal(true)}>Describe Photo
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={onDeletePhoto}>Delete Photo</button>
              </li>
            </>)}
            <li>
              <button className="dropdown-item" onClick={fileDropRef.current?.selectFile}>Upload Photos</button>
            </li>
          </ul>
        </div>
      </>)}
    </div>
    {canAdmin && <><EditorPanel menuItems={menuItems}>
      <h5>Photo Gallery Settings</h5>
      <FormEditor>
        <GalleryFields
          data={galleryConfig}
          onDelete={onDelete}
          onUpdate={handleUpdate}
        />
      </FormEditor>
      <DescribePhotoModal
        show={showDescribePhotoModal}
        onHide={() => setShowDescribePhotoModal(false)}
        onUpdate={handlePhotoUpdate}
        photoData={currentPhoto}
      />
    </EditorPanel>
    </>}
  </>;
}

/**
 * Utility to run an Iterable of Promises serially.
 * Like Promise.all() but not concurrent.
 * Returns an array of all the resolved values.
 *
 * @param promiseFunctions {[Promise<any>]}
 * @returns {[any]}
 */
function runSequentialFunctions(promiseFunctions) {
  return promiseFunctions.reduce((promiseChain, currentFunction) => {
    return promiseChain.then(resultsSoFar => {
      // Execute the current promise-returning function
      return currentFunction.then(currentResult => {
        // Concatenate the new result to the existing array of results
        return [...resultsSoFar, currentResult];
      });
    });
  }, Promise.resolve([])); // Start with a promise that resolves to an empty array
}