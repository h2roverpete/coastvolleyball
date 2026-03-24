import axios from "axios";


/**
 * @typedef SiteData
 *
 * @property {Number} SiteID            Unique Site ID.
 * @property {String} SiteName          Name of the site. Used for brand, breadcrumbs and copyright.
 * @property {String} SiteRootUrl       Root URL of the site.
 * @property {String} SiteTheme         Site theme 'light' or 'dark' variant of the selected style.
 * @property {String} SiteStyle         CSS style sheet for the site at https://resources.h2rover.net/css/
 * @property {String} SiteBucketName    S3 bucket name for deploying site files.
 * @property {String} Created           Creation date.
 * @property {String} Modified          Modification date.
 * @property {String} GoogleClientID    Google ID for analytics.
 */

/**
 * @typedef PageData
 *
 * @property {Number} PageID                Unique page ID.
 * @property {Number} SiteID                Site ID the page belongs to.
 * @property {Number} ParentID              Parent page ID. (0 for root level pages.)
 * @property {Number} OutlineSeq            Sequence relative to sibling pages in the site outline/nav.
 * @property {String} PageTitle             Page title displayed on the page as h1.PageTitle.
 * @property {String} PageTitleAlign        Alignment of page title, 'left', 'right' or 'center'
 * @property {String} NavTitle              Page title used in navigation bars and menus.
 * @property {String} PageMetaTitle         Meta title for window title bar.
 * @property {String} PageMetaDescription   Meta description for search engines.
 * @property {String} PageMetaKeywords      Meta keywords for search engines.
 * @property {Boolean} PageHidden           Hide page from site navigation?
 * @property {string} PageRoute             Unique page route for navigating to page within site.
 * @property {Boolean} RequiresLogin        Page requires user login and BROWSE_PROTECTED permission to view.
 * @property {String} Created               Creation timestamp.
 * @property {String} Modified              Modification timestamp. Used when updating the sitemap XML.
 */

/**
 * @typedef OutlineData
 * @augments PageData
 *
 * @property {Boolean} HasChildren
 * @property {String} OutlineSort
 * @property {number} OutlineLevel
 */

/**
 * @typedef PageSectionData
 *
 * @property {Number} PageSectionID
 * @property {Number} PageID
 * @property {Number} PageSectionSeq
 * @property {String} SectionTitle
 * @property {String} SectionText
 * @property {String} SectionImage
 * @property {String} SectionImageDescription
 * @property {String} SectionImageKeywords
 * @property {Boolean} SectionHidden
 * @property {Number} ImageWidth
 * @property {Number} ImageHeight
 * @property {String} ImageURL
 * @property {String} ImageURLTarget
 * @property {Number} ColSpan
 * @property {Number} ColumnWidth
 * @property {Boolean} HideImageFrame
 * @property {String} TitleAlign
 * @property {String} TextAlign
 * @property {String} TextVAlign
 * @property {String} ImageAlign
 * @property {String} ImageVAlign
 * @property {String} ImagePosition
 * @property {Boolean} ShowTitle
 * @property {Boolean} ShowText
 * @property {Boolean} ShowImage
 * @property {Boolean} DontMash
 * @property {String} Created
 * @property {String} Modified
 *
 * @property {[ExtraData]} Extras
 */

/**
 * @typedef GeneratedImageData
 *
 * @property GeneratedImageID {number}      Generated Image ID
 * @property ImageSize {string}             Image width x height, i.e. '4096x4096'
 * @property ImagePrompt {string}           Prompt for generating image.
 * @property ImageNegativePrompt {string}   Negative prompt (things not to generate).
 * @property ImageStyle {string}            Style of image, i.e. 'PHOTOREALISM'.
 * @property ImageCount {number}            Number of images to return.
 * @property ImagePath {string}             Path to image relative to site root
 * @property PageSectionID {number}         Page Section ID
 * @property PageID {number}                Page ID
 * @property SiteID {number}                Site ID
 * @property Image {string}                 Path to image from site root.
 * @property Created {string}               Creation date.
 * @property Modified {string}              Modification date.
 */

/**
 * @typedef GuestBookConfig
 *
 * @property {Number} GuestBookID
 * @property {String} GuestBookName
 * @property {String} GuestBookEmail
 * @property {String} GuestBookCCEmail
 * @property {String} GuestBookMessage
 * @property {Boolean} Inactive
 * @property {Number} ColorSchemeID
 * @property {Boolean} ShowName
 * @property {Boolean} ShowEmail
 * @property {Boolean} ShowCompany
 * @property {Boolean} ShowAddress
 * @property {Boolean} ShowDayPhone
 * @property {Boolean} ShowEveningPhone
 * @property {Boolean} ShowFax
 * @property {Boolean} ShowContactInfo
 * @property {Boolean} ShowMailingList
 * @property {Boolean} MailingListDefault
 * @property {Boolean} ShowFeedback
 * @property {Boolean} ShowLodgingFields
 * @property {String} TextCaption
 * @property {String} DoneMessage
 * @property {String} AgainMessage
 * @property {String} SubmitButtonName
 * @property {String} Created
 * @property {String} Modified
 * @property {Boolean} AlwaysEmail
 * @property {String} Custom1Label
 * @property {String} Custom1Type
 * @property {Boolean} Custom1UserEditable
 * @property {String} Custom1Required
 * @property {String} Custom1Options
 * @property {String} Custom1EmptyLabel
 * @property {String} Custom2Label
 * @property {String} Custom2Type
 * @property {Boolean} Custom2UserEditable
 * @property {String} Custom2Required
 * @property {String} Custom2Options
 * @property {String} Custom2EmptyLabel
 * @property {String} Custom3Label
 * @property {String} Custom3Type
 * @property {Boolean} Custom3UserEditable
 * @property {String} Custom3Required
 * @property {String} Custom3Options
 * @property {String} Custom3EmptyLabel
 * @property {String} Custom4Label
 * @property {String} Custom4Type
 * @property {Boolean} Custom4UserEditable
 * @property {String} Custom4Required
 * @property {String} Custom4Options
 * @property {String} Custom4EmptyLabel
 * @property {String} Custom5Label
 * @property {String} Custom5Type
 * @property {Boolean} Custom5UserEditable
 * @property {String} Custom5Required
 * @property {String} Custom5Options
 * @property {String} Custom5EmptyLabel
 * @property {String} Custom6Label
 * @property {String} Custom6Type
 * @property {Boolean} Custom6UserEditable
 * @property {String} Custom6Required
 * @property {String} Custom6Options
 * @property {String} Custom6EmptyLabel
 * @property {String} Custom7Label
 * @property {String} Custom7Type
 * @property {Boolean} Custom7UserEditable
 * @property {String} Custom7Required
 * @property {String} Custom7Options
 * @property {String} Custom7EmptyLabel
 * @property {String} Custom8Label
 * @property {String} Custom8Type
 * @property {Boolean} Custom8UserEditable
 * @property {String} Custom8Required
 * @property {String} Custom8Options
 * @property {String} Custom8EmptyLabel
 */

/**
 * @typedef GuestData
 *
 * @property {Number} GuestID
 * @property {Number} GuestBookID
 * @property {String} FirstName
 * @property {String} LastName
 * @property {String} Company
 * @property {String} Address1
 * @property {String} Address2
 * @property {String} City
 * @property {String} State
 * @property {String} Zip
 * @property {String} Country
 * @property {String} Email
 * @property {String} DayPhone
 * @property {String} EveningPhone
 * @property {String} Fax
 * @property {String} MailingList
 * @property {String} ContactMethod
 * @property {String} Created
 * @property {String} Modified
 * @property {Number} OldGuestID
 * @property {Number} UserID
 * @property {String} GuestCustom1
 * @property {String} GuestCustom2
 * @property {String} GuestCustom3
 * @property {String} GuestCustom4
 * @property {String} GuestCustom5
 * @property {String} GuestCustom6
 * @property {String} GuestCustom7
 * @property {String} GuestCustom8
 */

/**
 * @typedef GuestFeedbackData
 *
 * @property {Number} GuestFeedbackID
 * @property {String} FeedbackText
 * @property {String} HiddenText
 * @property {String} ArrivalDate
 * @property {String} DepartureDate
 * @property {Number} NumberOfGuests
 * @property {Number} GuestID
 * @property {String} Created
 * @property {Number} OldGuestID
 * @property {String} Custom1
 * @property {String} Custom2
 * @property {String} Custom3
 * @property {String} Custom4
 * @property {String} Custom5
 * @property {String} Custom6
 * @property {String} Custom7
 * @property {String} Custom8
 */

/**
 * @class GalleryData
 *
 * @property {number} GalleryID
 * @property {number} SiteID
 * @property {string} GalleryName
 * @property {string} GalleryDescription
 * @property {string} GalleryLongDescription
 * @property {string} GalleryDate
 * @property {boolean} RandomizeOrder
 * @property {string} Created
 * @property {string} Modified
 */

/**
 * @class PhotoData
 *
 * @property {number} PhotoID
 * @property {number} GalleryID
 * @property {number} GalleryPhotoSeq
 * @property {string} PhotoFile
 * @property {string} PhotoDescription
 * @property {string} PhotoKeywords
 * @property {string} PhotoSmall
 * @property {string} PhotoMedium
 * @property {string} PhotoLarge
 * @property {string} RootFileName
 * @property {string} SubDirectory
 * @property {string} PhotoDate
 * @property {string} Copyright
 * @property {string} Created
 * @property {string} Modified
 */

/**
 * @typedef ExtraData
 *
 * Data for content "extras" added to sites.
 * Each extra can store its own specific configuration data
 * in addition to the fields below.
 *
 * @property {Number} ExtraID           Unique ID for extra.
 * @property {Number} [PageID]          Page to insert the extra into.
 * @property {Number} [PageSectionID]   Page section to insert the extra into.
 * @property {String} ExtraType         Type of extra, i.e. "gallery" or "guestbook" or "instagram" or "youtube" or "file"
 * @property {String} [InstagramHandle] Handle for Instagram when ExtraType == 'instagram'
 * @property {String} [ExtraFile]       S3 path to file attached to the Extra
 * @property {String} [GalleryID]       Gallery ID when ExtraType == 'gallery'
 * @property {String} [GuestBookID]     Guest book ID when ExtraType == 'guestbook'
 * @property {String} [YouTubeVideoURL] Video URL when ExtraType == 'youtube'
 * @property {String} [AspectRatio]     Aspect ratio for display, i.e. 4 / 3 or  16 / 9.
 * @property {number} [DisplayWidth]    Display width in columns when ExtraDisplay is 'embed'
 * @property {string} ExtraDisplay      Display style: 'link', 'embed' or 'blank'
 * @property {string} ExtraDescription  Description of extra content.
 * @property {string} ExtraKeywords     Keywords for extra content.
 * @property {String} Created           Creation date in ISO format.
 * @property {String} Modified          Modification date in ISO format.
 */

/**
 * @typedef PresignedUrlRequest
 *
 * Request a presigned file upload url.
 *
 * POST data to [host]/api/v1/content/files/url
 *
 * @property {number} SiteID                      Site to add file to. User needs site admin privileges to upload files.
 * @property {string} FilePath                    Path to file relative to site root, i.e. 'files/'. Don't use an initial '/' in the path.
 * @property {string} CloudFrontDistributionID    Used to invalidate the existing file (if any) in CloudFront.
 * @property {string} [FileName]                  Requested file name to use. Note that uppercase, spaces and special characters will be transformed or removed.
 * @property {string} [FilePrefix]                Use in combination with FileExt to have the server auto-number a file. File name format is 'base00000.ext'
 * @property {string} [FileCounter]               Dynamo Counter to use for unique IDs, i.e. 'FileID'
 * @property {string} [FileExt]                   File extension for use with BaseFileName when auto-numbering a file. File name format is 'base00000.ext'
 */

/**
 * @typedef PresignedUrlResponse
 *
 * @property {string}   PresignedUrl  S3 presigned URL to receive a PUT request containing binary file data in the body.
 * @property {string}   Key           S3 key for the file once uploaded, i.e. 'path/to/file.ext'
 */

/**
 * @class RestAPI
 *
 * Class to access the backend server.
 *
 * @property siteId{Number}     Content site ID for resolving
 * @property host{String}       REST API host
 * @property apiKey{String}     API key for backend access
 */
class RestAPI {
  constructor(siteId, host, apiKey) {
    this.siteId = siteId;
    this.host = host;
    axios.defaults.headers.common["x-api-key"] = apiKey;
  }

  /**
   * Get page data.
   *
   * @param pageId{Number}    ID of page to fetch
   * @returns {Promise<PageData>}
   */
  async getPage(pageId) {
    const response = await axios.get(`${this.host}/api/v1/content/pages/${pageId}`);
    return response.data;
  }

  /**
   * Get the array of page sections.
   *
   * @param pageId{Number}    ID of page to fetch
   * @returns {Promise<[PageSectionData]>}
   */
  async getPageSections(pageId) {
    const response = await axios.get(`${this.host}/api/v1/content/pages/${pageId}/sections`);
    return response.data;
  }

  /**
   * Get the site configuration information.
   *
   * @returns {Promise<SiteData>}
   */
  async getSite() {
    const response = await axios.get(`${this.host}/api/v1/content/sites/${this.siteId}`);
    return response.data;
  }

  /**
   * Get the site configuration information.
   *
   * @returns {Promise<[OutlineData]>}
   */
  async getSiteOutline() {
    const response = await axios.get(`${this.host}/api/v1/content/sites/${this.siteId}/outline`);
    return response.data;
  }

  /**
   * Get the sitemap XML.
   *
   * @returns {Promise<[OutlineData]>}
   */
  async getSitemap() {
    const response = await axios.get(`${this.host}/api/v1/content/sites/${this.siteId}/sitemap`);
    return response.data;
  }

  /**
   * Get the guest book configuration.
   *
   * @param guestBookId{Number}
   * @returns {Promise<GuestBookConfig>}
   */
  async getGuestBook(guestBookId) {
    const response = await axios.get(`${this.host}/api/v1/guestbook/${guestBookId}`);
    return response.data;
  }

  /**
   * Retrieve guest data
   *
   * @param guestId {Number}
   * @return {Promise<GuestData>}
   */
  async getGuest(guestId) {
    const response = await axios.get(`${this.host}/api/v1/guestbook/guest/${guestId}`);
    return response.data;
  }

  /**
   * Post guest data
   *
   * @param guestBookId {Number}
   * @param data {GuestData}
   * @return {Promise<GuestData>}
   */
  async insertOrUpdateGuest(guestBookId, data) {
    const response = await axios.post(`${this.host}/api/v1/guestbook/${guestBookId}/guest`, data);
    return response.data;
  }

  /**
   * Retrieve guest feedback
   *
   * @param guestFeedbackId {Number}
   * @return {Promise<GuestFeedbackData>}
   */
  async getGuestFeedback(guestFeedbackId) {
    const response = await axios.get(`${this.host}/api/v1/guestbook/feedback/${guestFeedbackId}`);
    return response.data;
  }

  /**
   * Submit guest feedback
   *
   * @param guestId {Number}
   * @param data {GuestFeedbackData}
   * @return {Promise<GuestFeedbackData>}
   */
  async insertOrUpdateGuestFeedback(guestId, data) {
    const response = await axios.post(`${this.host}/api/v1/guestbook/guest/${guestId}/feedback`, data);
    return response.data;
  }

  /**
   * Retrieve photo gallery info.
   *
   * @param galleryId {Number}
   * @return {Promise<GalleryData>}
   */
  async getGallery(galleryId) {
    const response = await axios.get(`${this.host}/api/v1/gallery/${galleryId}`);
    return response.data;
  }

  /**
   * Retrieve list of photos in a gallery.
   *
   * @param galleryId {Number}
   * @return {Promise<[PhotoData]>}
   */
  async getPhotos(galleryId) {
    const response = await axios.get(`${this.host}/api/v1/gallery/${galleryId}/photos`);
    return response.data;
  }

  async getAuthToken(clientId, redirectUrl, authCode) {
    const response = await axios.post(`${this.host}/oauth/token?client_id=${clientId}&redirect_uri=${redirectUrl}&code=${authCode}&grant_type=authorization_code`);
    return response.data;
  }
}

export default RestAPI;


