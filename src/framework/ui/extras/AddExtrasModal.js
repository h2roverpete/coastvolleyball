import EmailField from "../forms/EmailField";
import {isValidEmail, isValidInstagramHandle, isValidYouTubeUrl} from "../../util/Validators";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {usePageContext} from "../content/Page";
import {useEffect, useRef, useState} from "react";
import {Button, Col, Form, Modal, Row, Spinner} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import YouTubeExtraFields from "./youtube/YouTubeExtraFields";
import InstagramExtraFields from "./instagram/InstagramExtraFields";
import FileExtraFields from "./file/FileExtraFields";
import {useAuth} from "../../auth/AuthProvider";
import {Permission, Resource} from "../../auth/Permissions";

/**
 * @callback Callback
 * Callback function with no params.
 */

/**
 * Modal dialog for adding content extras.
 *
 * @param show    {Boolean}
 * @param onHide  {function()}
 * @param onSubmit {function()}
 * @param pageSectionId {Number}
 * @returns {JSX.Element}
 * @constructor
 */
export default function AddExtrasModal({show, onHide, onSubmit, pageSectionId}) {

  const {siteData, showErrorAlert} = useSiteContext();
  const {pageData, addExtraToPage} = usePageContext();
  const {GuestBooks, Galleries, Extras, SMS} = useRestApi();
  const {hasPermission} = useAuth();

  /** @type FormDataAPI<ExtraData> */
  const formData = useFormData();

  // states
  const [guestBookList, setGuestBookList] = useState([]);
  const [galleryList, setGalleryList] = useState([]);
  const [smsCampaignsList, setSmsCampaignsList] = useState([]);
  const [canEdit, setCanEdit] = useState(false);

  // refs
  const uploadingRef = useRef(null);
  const submitRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.PAGE, Permission.EDIT));
  }, [setCanEdit, hasPermission]);

  useEffect(() => {
    if (canEdit && siteData) {
      // load list of existing galleries
      Galleries.getGalleries().then((result) => {
        const siteGalleries = [];
        for (const gallery of result) {
          if (!gallery.SiteID || gallery.SiteID === siteData.SiteID) {
            siteGalleries.push(gallery);
          }
        }
        console.debug(`List of ${siteGalleries.length} galleries loaded.`);
        setGalleryList(siteGalleries);
      }).catch((err) => {
        showErrorAlert(`Error getting gallery list.`, err);
      })
    }
  }, [canEdit, siteData, Galleries, showErrorAlert]);

  useEffect(() => {
    if (canEdit && siteData) {
      // load list of existing guest books
      GuestBooks.getGuestBooks().then((result) => {
        const siteGuestBooks = [];
        for (const guestBook of result) {
          if (!guestBook.SiteID || guestBook.SiteID === siteData.SiteID) {
            siteGuestBooks.push(guestBook);
          }
        }
        console.debug(`List of ${siteGuestBooks.length} guest books loaded.`);
        setGuestBookList(siteGuestBooks);
      }).catch((err) => {
        showErrorAlert(`Error getting guest book list.`, err);
      })
    }
  }, [canEdit, siteData, GuestBooks, showErrorAlert]);

  useEffect(() => {
    if (canEdit && siteData) {
      // load list of existing sms campaigns
      SMS.getSmsCampaigns().then((result) => {
        const siteCampaigns = [];
        for (const campaign of result) {
          if (!campaign.SiteID || campaign.SiteID === siteData.SiteID) {
            siteCampaigns.push(campaign);
          }
        }
        console.debug(`List of ${siteCampaigns.length} SMS campaigns loaded.`);
        setSmsCampaignsList(siteCampaigns);
      }).catch((err) => {
        showErrorAlert(`Error getting SMS campaigns list.`, err);
      })
    }
  }, [canEdit, siteData, Galleries, showErrorAlert, SMS]);

  if (!canEdit) {
    return <></>;
  }

  function onAddExtra() {
    submitRef.current.disabled = true;
    cancelRef.current.disabled = true;
    switch (formData.edits.ExtraType) {
      case 'gallery':
        if (formData.edits.GalleryID) {
          console.debug(`Adding gallery extra.`);
          Extras.insertOrUpdateExtra({
            ExtraType: formData.edits.ExtraType,
            SiteID: siteData.SiteID,
            PageID: pageData.PageID,
            PageSectionID: pageSectionId,
            GalleryID: formData.edits.GalleryID
          }).then((extra) => {
            console.debug(`Extra added.`);
            onExtraAdded(extra);
          }).catch((err) => {
            showErrorAlert(`Error adding extra.`, err);
          });
        } else {
          Galleries.insertOrUpdateGallery({
            SiteID: siteData.SiteID,
            GalleryName: formData.edits.GalleryName,
          }).then((result) => {
            console.debug(`Gallery added.`);
            Extras.insertOrUpdateExtra({
              ExtraType: formData.edits.ExtraType,
              SiteID: siteData.SiteID,
              PageID: pageData.PageID,
              PageSectionID: pageSectionId,
              GalleryID: result.GalleryID
            }).then((extra) => {
              console.debug(`Extra added.`);
              onExtraAdded(extra);
            }).catch((err) => {
              showErrorAlert(`Error adding extra.`, err);
            });
          }).catch((err) => {
            showErrorAlert(`Error adding gallery.`, err);
          });
        }
        break;
      case 'guestbook':
        if (!formData.edits.GuestBookID) {
          GuestBooks.insertOrUpdateGuestBook({
            GuestBookName: formData.edits.GuestBookName,
            GuestBookEmail: formData.edits.GuestBookEmail,
            SiteID: siteData.SiteID,
            ShowName: true,
            ShowEmail: true,
            ShowPhone: true,
            ShowFeedback: true
          }).then((result) => {
            console.debug(`Guest book added.`);
            Extras.insertOrUpdateExtra({
              ExtraType: formData.edits.ExtraType,
              SiteID: siteData.SiteID,
              PageID: pageData.PageID,
              PageSectionID: pageSectionId,
              GuestBookID: result.GuestBookID
            }).then((extra) => {
              console.debug(`Extra added.`);
              onExtraAdded(extra);
            }).catch((err) => {
              showErrorAlert(`Error adding extra.`, err);
            });
          }).catch((error) => {
            showErrorAlert(`Error adding guest book.`, error);
          })
        } else {
          // create an Extra for an existing guest book
          Extras.insertOrUpdateExtra({
            ExtraType: formData.edits.ExtraType,
            SiteID: siteData.SiteID,
            PageID: pageData.PageID,
            PageSectionID: pageSectionId,
            GuestBookID: formData.edits.GuestBookID
          }).then((extra) => {
            console.debug(`Extra added.`);
            onExtraAdded(extra);
          }).catch((err) => {
            showErrorAlert(`Error adding extra.`, err);
          });
        }
        break;
      case 'sms':
        if (!formData.edits.SMSCampaignID) {
          // TODO create new SMS campaign
        } else {
          // create an Extra for an existing SMS campaign
          Extras.insertOrUpdateExtra({
            ExtraType: formData.edits.ExtraType,
            SiteID: siteData.SiteID,
            PageID: pageData.PageID,
            PageSectionID: pageSectionId,
            SMSCampaignID: formData.edits.SMSCampaignID
          }).then((extra) => {
            console.debug(`Extra added.`);
            onExtraAdded(extra);
          }).catch((err) => {
            showErrorAlert(`Error adding extra.`, err);
          });
        }
        break;
      case 'file':
      case 'instagram':
      case 'youtube':
        uploadingRef.current?.classList.remove('d-none');
        console.debug(`Adding extra.`);
        Extras.insertOrUpdateExtra({
          ...formData.edits,
          SiteID: siteData.SiteID,
          PageID: pageData.PageID,
          PageSectionID: pageSectionId,
        }).then((extra) => {
          console.debug(`Extra added.`);
          onExtraAdded(extra);
        }).catch((err) => showErrorAlert(`Error adding extra.`, err));
        break;
      default:
        showErrorAlert(`Unsupported extra type ${formData.edits.ExtraType}`)
    }
  }

  /**
   * Called after an Extra is successfully added.
   */
  function onExtraAdded(extra) {
    formData.revert();
    addExtraToPage(extra);
    onHide?.();
    onSubmit?.();
  }

  function isDataValid() {
    switch (formData.edits.ExtraType) {
      case 'guestbook':
        if (!formData.edits.GuestBookID) {
          return isValidEmail(formData.edits.GuestBookEmail) && formData.edits.GuestBookName.length > 0;
        } else {
          return formData.edits.GuestBookID > 0;
        }
      case 'gallery':
        return ((!formData.edits.GalleryID && formData.edits.GalleryName?.length > 0) || formData.edits.GalleryID > 0);
      case 'instagram':
        return isValidInstagramHandle(formData.edits.InstagramHandle);
      case 'youtube':
        return isValidYouTubeUrl(formData.edits.YouTubeVideoUrl);
      case 'file':
        return formData.edits.ExtraFile !== null
      case 'sms':
        return formData.edits.SMSCampaignID > 0 || formData.edits.CampaignName?.length > 0
      default:
        return false;
    }
  }

  function onCancel() {
    formData.revert();
    onHide?.();
  }

  const labelCols = 4;

  return (
    <Modal show={show}>
      <Modal.Header><h5>Add an Extra</h5></Modal.Header>
      <Modal.Body>
        <Row>
          <Form.Label
            className='required'
            column={'sm'}
            htmlFor={'ExtraType'}
            sm={labelCols}
          >
            Extra Type
          </Form.Label>
          <Col>
            <Form.Select
              id="ExtraType"
              size={'sm'}
              value={formData.edits.ExtraType}
              onChange={(e) => formData.onDataChanged({name: 'ExtraType', value: e.target.value})}
            >
              <option value={''}>(Select)</option>
              <option value='gallery'>Photo Gallery</option>
              <option value='guestbook'>Guest Book</option>
              <option value='instagram'>Instagram Gallery</option>
              <option value='youtube'>YouTube Video</option>
              <option value='file'>File</option>
              <option value='sms'>SMS Campaign</option>
            </Form.Select>
          </Col>
        </Row>
        {formData.edits.ExtraType === 'guestbook' && (<>
          <Row className="mt-2">
            <Col sm={labelCols}></Col>
            <Col hidden={guestBookList?.length === 0}>
              <Form.Check
                type='radio'
                name={'NewGuestBook'}
                className='form-control-sm'
                label='Create new guest book'
                checked={formData.edits.GuestBookID === undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'GuestBookID', value: undefined});
                }}
              />
              <Form.Check
                type='radio'
                name={'NewGuestBook'}
                value={'true'}
                className='form-control-sm'
                label='Use existing guest book'
                checked={formData.edits.GuestBookID !== undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'GuestBookID', value: 0});
                }}
              />
            </Col>
          </Row>
          {formData.edits.GuestBookID === undefined ? (<>
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'GuestBookName'} sm={labelCols}>
                Title for Emails</Form.Label>
              <Col>
                <Form.Control
                  id="GuestBookName"
                  name="GuestBookEmail"
                  size="sm"
                  isValid={formData.isTouched('GuestBookName') && formData.edits.GuestBookName.length > 0}
                  isInvalid={formData.isTouched('GuestBookName') && formData.edits.GuestBookName.length === 0}
                  onChange={(e) => formData.onDataChanged({name: 'GuestBookName', value: e.target.value})}
                  value={formData.edits.GuestBookName || ''}
                />
              </Col>
            </Row>
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'GuestBookEmail'} sm={labelCols}>Admin
                Email</Form.Label>
              <Col>
                <EmailField
                  id="GuestBookEmail"
                  name="GuestBookEmail"
                  size="sm"
                  onChange={(e) => formData.onDataChanged({name: 'GuestBookEmail', value: e.target.value})}
                  value={formData.edits.GuestBookEmail}
                />
              </Col>
            </Row>
          </>) : (<>
            <Row className="mt-2">
              <Form.Label
                className='required'
                column={'sm'}
                htmlFor={'GuestBook'}
                sm={labelCols}
              >Guest Book
              </Form.Label>
              <Col>
                <Form.Select
                  id="GuestBook"
                  name="GuestBookEmail"
                  size="sm"
                  onChange={(e) => formData.onDataChanged({name: 'GuestBookID', value: parseInt(e.target.value)})}
                  value={formData.edits.GuestBookID}
                >
                  <option key={''} value={0}>(Select a guest book)</option>
                  {guestBookList.map((guestBook) => (
                    <option key={guestBook.GuestBookID} value={guestBook.GuestBookID}>{guestBook.GuestBookName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </>)}
        </>)}
        {formData.edits.ExtraType === 'gallery' && (<>
          <Row className="mt-2">
            <Col sm={labelCols}></Col>
            <Col hidden={galleryList?.length === 0}>
              <Form.Check
                type='radio'
                name={'NewGallery'}
                className='form-control-sm'
                label='Create new gallery'
                checked={formData.edits.GalleryID === undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'GalleryID', value: undefined});
                }}
              />
              <Form.Check
                type='radio'
                name={'NewGallery'}
                value={'true'}
                className='form-control-sm'
                label='Use existing gallery'
                checked={formData.edits.GalleryID !== undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'GalleryID', value: 0});
                }}
              />
            </Col>
          </Row>
          {formData.edits.GalleryID !== undefined ? (
            <Row className="mt-2">
              <Form.Label
                className='required'
                column={'sm'}
                htmlFor={'Gallery'}
                sm={labelCols}
              >Gallery
              </Form.Label>
              <Col>
                <Form.Select
                  id="Gallery"
                  size="sm"
                  onChange={(e) => formData.onDataChanged({name: 'GalleryID', value: parseInt(e.target.value)})}
                  value={formData.edits.GalleryID}
                >
                  <option key={''} value={0}>(Select a gallery)</option>
                  {galleryList.map((gallery) => (
                    <option key={gallery.GalleryID} value={gallery.GalleryID}>{gallery.GalleryName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          ) : (
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'GalleryName'} sm={labelCols}>
                Gallery Name</Form.Label>
              <Col>
                <Form.Control
                  id="GalleryName"
                  name="GalleryName"
                  size="sm"
                  isValid={formData.isTouched('GalleryName') && formData.edits.GalleryName.length > 0}
                  isInvalid={formData.isTouched('GalleryName') && formData.edits.GalleryName.length === 0}
                  onChange={(e) => formData.onDataChanged({name: 'GalleryName', value: e.target.value})}
                  value={formData.edits.GalleryName || ''}
                />
              </Col>
            </Row>
          )}
        </>)}
        {formData.edits.ExtraType === 'sms' && (<>
          <Row className="mt-2">
            <Col sm={labelCols}></Col>
            <Col hidden={smsCampaignsList?.length === 0}>
              <Form.Check
                type='radio'
                name={'NewSmsCampaign'}
                className='form-control-sm'
                label='Create new SMS campaign'
                checked={formData.edits.SMSCampaignID === undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'SMSCampaignID', value: undefined});
                }}
              />
              <Form.Check
                type='radio'
                name={'NewSmsCampaign'}
                value={'true'}
                className='form-control-sm'
                label='Use existing SMS campaign'
                checked={formData.edits.SMSCampaignID !== undefined}
                onChange={() => {
                  formData.onDataChanged({name: 'SMSCampaignID', value: 0});
                }}
              />
            </Col>
          </Row>
          {formData.edits.SMSCampaignID !== undefined ? (
            <Row className="mt-2">
              <Form.Label
                className='required'
                column={'sm'}
                htmlFor={'SMSCampaign'}
                sm={labelCols}
              >SMS Campaign
              </Form.Label>
              <Col>
                <Form.Select
                  id="SMSCampaign"
                  size="sm"
                  onChange={(e) => formData.onDataChanged({name: 'SMSCampaignID', value: parseInt(e.target.value)})}
                  value={formData.edits.SMSCampaignID}
                >
                  <option key={''} value={0}>(Select an SMS campaign)</option>
                  {smsCampaignsList.map((campaign) => (
                    <option key={campaign.SMSCampaignID} value={campaign.SMSCampaignID}>{campaign.CampaignName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          ) : (
            <Row className="mt-2">
              <Form.Label className='required' column={'sm'} htmlFor={'CampaignName'} sm={labelCols}>
                Campaign Name</Form.Label>
              <Col>
                <Form.Control
                  id="CampaignName"
                  name="CampaignName"
                  size="sm"
                  isValid={formData.isTouched('CampaignName') && formData.edits.CampaignName.length > 0}
                  isInvalid={formData.isTouched('CampaignName') && formData.edits.CampaignName.length === 0}
                  onChange={(e) => formData.onDataChanged({name: 'CampaignName', value: e.target.value})}
                  value={formData.edits.CampaignName || ''}
                />
              </Col>
            </Row>
          )}
        </>)}
        {formData.edits.ExtraType === 'instagram' && (
          <InstagramExtraFields/>
        )}
        {formData.edits.ExtraType === 'youtube' && (
          <YouTubeExtraFields/>
        )}
        {formData.edits.ExtraType === 'file' && (
          <FileExtraFields/>
        )}
      </Modal.Body>
      <Modal.Footer>
        <div
          ref={uploadingRef}
          className="d-flex align-items-center justify-content-start small flex-grow-1 d-none"
        >
          <Spinner animation="border" role="status" className='me-2'/> Uploading...<br/>
        </div>
        <Button size="sm" variant="secondary" onClick={onCancel} ref={cancelRef}>Cancel</Button>
        <Button
          size="sm"
          variant="primary"
          disabled={!isDataValid()}
          onClick={() => {
            onAddExtra();
          }}
          ref={submitRef}
        >Add Extra</Button>
      </Modal.Footer>
    </Modal>
  );

}