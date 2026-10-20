import React, {useCallback, useContext, useRef} from 'react';
import {useCookies} from "react-cookie";
import axios from "axios";

export const RestApiContext = React.createContext({});

const host = process.env.REACT_APP_BACKEND_HOST;

export default function RestApi(props) {

  const siteId = parseInt(process.env.REACT_APP_SITE_ID);
  const apiKey = process.env.REACT_APP_API_KEY;
  const [cookies] = useCookies(); // can't use auth context, access directly

  axios.defaults.headers.common["x-api-key"] = apiKey;
  if (cookies.token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${cookies.token.access_token}`;
  }
  axios.defaults.timeout = 5 * 60 * 1000;

  const getSites = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/content/sites`, data);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateSite = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/sites`, data);
        return response.data;
      }
    });
  }, []);

  const deleteSite = useCallback(async (siteId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/sites/${siteId}`);
        return response.data;
      }
    });
  }, []);

  const getPage = useCallback(async (pageId) => {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}`);
    return response.data;
  }, []);

  const describePage = useCallback(async (pageId) => {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/describe`);
    return response.data;
  }, []);

  const getPageSections = useCallback(async (pageId) => {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/sections`);
    return response.data;
  }, []);

  const insertOrUpdatePageSection = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        // remove Extras array from section data before updating DB
        const {Extras, ...dbData} = data;
        const response = await axios.post(`${host}/api/v1/content/pages/${data.PageID}/sections`, dbData);
        return response.data;
      }
    });
  }, []);

  const uploadSectionImage = useCallback(async (siteId, pageSectionData, file) => {
    return await adminApiCall(() => {
      // remove Extras array from section data sent to API
      const {Extras, ...newData} = pageSectionData;
      return async () => {
        // upload image
        const newFile = await uploadFileToS3({
          siteId: siteId,
          file: file,
          path: 'images/',
          prefix: 'image',
          counter: 'ImageID',
          extension: getFileExtension(file.type)
        });
        // update section record
        const parts = newFile.split('/');
        newData.SectionImage = parts[parts.length - 1]; // remove path from file name
        const response = await axios.post(`${host}/api/v1/content/pages/${pageSectionData.PageID}/sections/`, newData);
        return response.data;
      }
    });
  }, []);

  const deleteSectionImage = useCallback(async (pageId, pageSectionId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image`);
        return response.data;
      }
    });
  }, []);

  const generateSectionImages = useCallback(async (pageId, pageSectionId, data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image/generate`, data);
        return response.data;
      }
    });
  }, []);

  const deleteGeneratedImage = useCallback(async (pageId, pageSectionId, generatedImageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image/generated/${generatedImageId}`);
        return response.data;
      }
    });
  }, []);

  const deletePageSection = useCallback(async (pageId, pageSectionId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}`);
        return response.data;
      }
    });
  }, []);

  /**
   * Get description and keywords for a section image.
   *
   * @param pageId {number}
   * @param pageSectionId {number}
   * @returns {Promise<SummaryData>}
   */
  const describeSectionImage = async (pageId, pageSectionId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/sections/${pageSectionId}/image/describe`);
        return response.data;
      }
    });
  };

  const insertOrUpdatePage = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        console.debug("Insert or update Page...");
        const response = await axios.post(`${host}/api/v1/content/pages`, data);
        return response.data;
      }
    });
  }, []);

  const deletePage = useCallback(async (pageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/pages/${pageId}`);
        return response.data;
      }
    });
  }, []);

  const movePageBefore = useCallback(async (pageId, beforePageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/before/${beforePageId}`);
        return response.data;
      }
    });
  }, []);

  const movePageAfter = useCallback(async (pageId, afterPageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/after/${afterPageId}`);
        return response.data;
      }
    });
  }, []);

  const makePageChildOf = useCallback(async (pageId, parentId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/pages/${pageId}/childof/${parentId}`);
        return response.data;
      }
    });
  }, []);

  const getSite = useCallback(async (altSiteId) => {
    const id = altSiteId ? altSiteId : siteId;
    const response = await axios.get(`${host}/api/v1/content/sites/${id}`);
    return response.data;
  }, [siteId]);

  const getSiteOutline = useCallback(async (altSiteId) => {
    const id = altSiteId ? altSiteId : siteId;
    const response = await axios.get(`${host}/api/v1/content/sites/${id}/outline`);
    return response.data;
  }, [siteId]);

  const getSitemap = useCallback(async () => {
    const response = await axios.get(`${host}/api/v1/content/sites/${siteId}/sitemap`);
    return response.data;
  }, [siteId]);

  const getGuestBooks = useCallback(async () => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/guestbooks`);
        return response.data;
      }
    });
  }, []);

  const getGuestBook = useCallback(async (guestBookId) => {
    const response = await axios.get(`${host}/api/v1/guestbook/${guestBookId}`);
    return response.data;
  }, []);

  const insertOrUpdateGuestBook = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/guestbook`, data);
        return response.data;
      }
    });
  }, []);

  const deleteGuestBook = useCallback(async (guestBookId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/guestbook/${guestBookId}`);
        return response.data;
      }
    });
  }, []);

  const getGuest = useCallback(async (guestId) => {
    const response = await axios.get(`${host}/api/v1/guestbook/guest/${guestId}`);
    return response.data;
  }, []);

  const insertOrUpdateGuest = useCallback(async (guestBookId, data) => {
    const response = await axios.post(`${host}/api/v1/guestbook/${guestBookId}/guest`, data);
    return response.data;
  }, []);

  const getGuestFeedback = useCallback(async (guestFeedbackId) => {
    const response = await axios.get(`${host}/api/v1/guestbook/feedback/${guestFeedbackId}`);
    return response.data;
  }, []);

  const insertOrUpdateGuestFeedback = useCallback(async (guestId, data) => {
    const response = await axios.post(`${host}/api/v1/guestbook/guest/${guestId}/feedback`, data);
    return response.data;
  }, []);

  const searchGuestBook = useCallback(async (guestBookId, searchText) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/guestbook/${guestBookId}/search`, {searchText: searchText});
        return response.data;
      }
    });
  }, []);

  const deleteGuest = useCallback(async (guestBookId, guestId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/guestbooks/${guestBookId}/guests/${guestId}`);
        return response.data;
      }
    });
  }, []);


  const getGallery = useCallback(async (galleryId) => {
    const response = await axios.get(`${host}/api/v1/galleries/${galleryId}`);
    return response.data;
  }, []);

  const getGalleries = useCallback(async () => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/galleries`);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateGallery = useCallback(async (data) => {
    return adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/galleries`, data);
        return response.data;
      }
    });
  }, []);

  const deleteGallery = useCallback(async (galleryId) => {
    return adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/galleries/${galleryId}`);
        return response.data;
      }
    });
  }, []);

  const getPhotos = useCallback(async (galleryId) => {
    const response = await axios.get(`${host}/api/v1/galleries/${galleryId}/photos`);
    return response.data;
  }, []);

  const uploadPhoto = useCallback(async (siteId, galleryId, file) => {
    return await adminApiCall(() => {
      return async () => {
        // upload file to S3
        const parts = file.name.split('.');
        const extension = parts[parts.length - 1];
        const newFile = await uploadFileToS3({
          siteId: siteId,
          file: file,
          path: 'photos/',
          prefix: 'photo',
          counter: 'PhotoID',
          extension: extension,
        });
        const formData = new FormData();
        formData.append('PhotoFileName', newFile);
        const response = await axios.post(`${host}/api/v1/galleries/${galleryId}/photos`, formData);
        return response.data;
      }
    });
  }, []);

  /**
   * Update a gallery photo.
   *
   * @param galleryId {number}
   * @param photoId {number}
   * @param data {PhotoData}
   *
   * @returns {Promise<PhotoData>}
   */
  const updatePhoto = async (galleryId, photoId, data) => {
    return adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/galleries/${galleryId}/photos/${photoId}`, data);
        return response.data;
      }
    });
  };

  const deletePhoto = useCallback(async (galleryId, photoId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/galleries/${galleryId}/photos/${photoId}`);
        return response.data;
      }
    });
  }, []);

  /**
   * Describe a gallery photo.
   *
   * @param galleryId {number}
   * @param photoId {number}
   * @returns {Promise<SummaryData>}  Summary containing description and keywords.
   */
  const describePhoto = async (galleryId, photoId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/galleries/${galleryId}/photos/${photoId}/describe`);
        return response.data;
      }
    });
  };

  const getPageExtras = useCallback(async (pageId) => {
    const response = await axios.get(`${host}/api/v1/content/pages/${pageId}/extras`);
    return response.data;
  }, []);

  async function getSiteExtras(siteId) {
    const response = await axios.get(`${host}/api/v1/content/sites/${siteId}/extras`);
    return response.data;
  }

  const insertOrUpdateExtra = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        if (data.ExtraFile?.name) {
          // user selected a file
          // upload file to S3 and set name
          data.ExtraFileName = await uploadFileToS3({
            siteId: data.SiteID,
            file: data.ExtraFile,
            name: data.ExtraFile.name,
            path: 'files/',
            invalidate: true,
          });
          data.ExtraFileMimeType = data.ExtraFile.type;
          // delete file from data, it has already been uploaded
          delete data.ExtraFile;
        }
        const formData = new FormData();
        for (const fieldName in data) {
          if (data[fieldName] !== undefined && data[fieldName] !== null) {
            formData.append(fieldName, data[fieldName]);
          }
        }
        const response = await axios.post(`${host}/api/v1/content/extras`, formData);
        return response.data;
      }
    });
  }, []);

  const deleteExtra = useCallback(async (extraId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/content/extras/${extraId}`);
        return response.data;
      }
    });
  }, []);

  const moveExtraUp = useCallback(async (extraId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/extras/${extraId}/moveup`);
        return response.data;
      }
    });
  }, []);

  const moveExtraDown = useCallback(async (extraId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/content/extras/${extraId}/movedown`);
        return response.data;
      }
    });
  }, []);

  /**
   * Get description and keywords for an extra.
   *
   * @param extraId {number}
   * @returns {Promise<SummaryData>}
   */
  const describeExtra = async (extraId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/content/extras/${extraId}/describe`);
        return response.data;
      }
    });
  };

  const getUsers = useCallback(async () => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/users`);
        return response.data;
      }
    });
  }, []);

  const getUser = useCallback(async (userId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/users/${userId}`);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateUser = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/users`, data);
        return response.data;
      }
    });
  }, []);

  const deleteUser = useCallback(async (userId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/users/${userId}`);
        return response.data;
      }
    });
  }, []);

  const getAuthToken = useCallback(async (clientId, redirectUrl, authCode) => {
    const response = await axios.post(`${host}/oauth/token?client_id=${clientId}&redirect_uri=${redirectUrl}&code=${authCode}&grant_type=authorization_code`);
    return response.data;
  }, []);

  const refreshToken = useCallback(async (refreshToken, clientId) => {
    const response = await axios.post(`${host}/oauth/token?client_id=${clientId}&grant_type=refresh_token&refresh_token=${refreshToken}`);
    return response.data;
  }, []);

  const checkToken = useCallback(async () => {
    const response = await axios.get(`${host}/oauth/check`);
    return response.data;
  }, []);

  const getAuthClients = useCallback(async () => {
    const response = await axios.get(`${host}/oauth/clients`);
    return response.data;
  }, []);

  const insertOrUpdateAuthClient = useCallback(async (data) => {
    const response = await axios.post(`${host}/oauth/clients`, data);
    return response.data;
  }, []);

  const deleteAuthClient = useCallback(async (client_id) => {
    const response = await axios.delete(`${host}/oauth/clients/${client_id}`);
    return response.data;
  }, []);

  const getSmsCampaigns = useCallback(async () => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns`);
        return response.data;
      }
    });
  }, []);

  const getSmsCampaign = useCallback(async (smsCampaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${smsCampaignId}`);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateSmsCampaign = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns`, data);
        return response.data;
      }
    });
  }, []);

  const deleteSmsCampaign = useCallback(async (campaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/sms/campaigns/${campaignId}`);
        return response.data;
      }
    });
  }, []);

  const getSmsSubscriber = useCallback(async (campaignId, subscriberId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/subscribers/${subscriberId}`);
        return response.data;
      }
    });
  }, []);

  const getSmsCampaignSubscribers = useCallback(async (campaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/subscribers`);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateSmsSubscriber = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${data.SMSCampaignID}/subscribers`, data);
        return response.data;
      }
    });
  }, []);

  const deleteSmsSubscriber = useCallback(async (campaignId, subscriberId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/sms/campaigns/${campaignId}/subscribers/${subscriberId}`);
        return response.data;
      }
    });
  }, []);

  const getSmsMessages = useCallback(async (campaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/messages`);
        return response.data;
      }
    });
  }, []);

  const getSmsMessage = useCallback(async (campaignId, messageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}`);
        return response.data;
      }
    });
  }, []);

  /**
   * Insert or update an SMS message and send to all subscribers.
   *
   * To limit the recipients to specific subscribers, include a Subscribers array in the message data.
   *
   * @type {function(SMSMessageData): Promise<SMSMessageData>}
   */
  const sendSmsMessage = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${data.SMSCampaignID}/send`, data);
        return response.data;
      }
    });
  }, []);

  /**
   * Insert or update SMS message without sending anything.
   *
   * @type {function(SMSMessageData): Promise<SMSMessageData>}
   */
  const insertOrUpdateSmsMessage = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${data.SMSCampaignID}/messages`, data);
        return response.data;
      }
    });
  }, []);

  const deleteSmsMessage = useCallback(async (campaignId, messageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}`);
        return response.data;
      }
    });
  }, []);

  const getMmsFiles = useCallback(async (campaignId, messageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}/files`);
        return response.data;
      }
    });
  }, []);

  /**
   * Upload a file and attach to a message.
   *
   * @type {function(Number, Number, Number, File): Promise<MMSFileData>}
   */
  const uploadMmsFile = useCallback(async (siteId, campaignId, messageId, file) => {
    return await adminApiCall(() => {
      return async () => {
        const data = {
          SiteID: siteId,
          SMSCampaignID: campaignId,
          SMSMessageID: messageId,
        };
        if (file.name) {
          // resize image file to max 1024 pixels
          const resizedFile = await resizeImageFile(file, 1080, 1920);
          resizedFile.name = `${crypto.randomUUID()}.jpg`;
          // upload file to S3 and set name
          data.MMSFileName = await uploadFileToS3({
            siteId: siteId,
            file: resizedFile,
            path: 'mms/',
            invalidate: true,
          });
          data.MMSFileMimeType = file.type;
        }
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}/files`, data);
        return response.data;
      }
    });
  }, []);

  const deleteMmsFile = useCallback(async (campaignId, messageId, fileId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}/files/${fileId}`);
        return response.data;
      }
    });
  }, []);


  /**
   * Resizes an image file maintaining aspect ratio.
   * @param {File} file - The original image file from an input field.
   * @param {number} maxWidth - The maximum width target.
   * @param {number} maxHeight - The maximum height target.
   * @returns {Promise<Blob>} A promise that resolves to the resized Blob.
   */
  function resizeImageFile(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Read file as Data URL (base64 string)
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions preserving the aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          // Create an off-screen canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          // Draw the image onto the canvas at new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas back to a Blob object (JPEG format, 85% quality)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed.'));
              }
            },
            'image/jpeg',
            0.85
          );
        };

        img.onerror = (err) => reject(err);
      };

      reader.onerror = (err) => reject(err);
    });
  }


  const getSmsWhitelist = useCallback(async (campaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/whitelist`);
        return response.data;
      }
    });
  }, []);

  const insertOrUpdateSmsWhitelistEntry = useCallback(async (data) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${data.SMSCampaignID}/whitelist/`, data);
        return response.data;
      }
    });
  }, []);

  const deleteSmsWhitelistEntry = useCallback(async (smsCampaignId, entryId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.delete(`${host}/api/v1/sms/campaigns/${smsCampaignId}/whitelist/${entryId}`);
        return response.data;
      }
    });
  }, []);

  const getSmsCampaignLog = useCallback(async (campaignId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/log`);
        return response.data;
      }
    });
  }, []);

  const getSmsMessageLog = useCallback(async (campaignId, messageId) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.get(`${host}/api/v1/sms/campaigns/${campaignId}/messages/${messageId}/log`);
        return response.data;
      }
    });
  }, []);

  /**
   * Return paginated log data.
   *
   * @param {Number} campaignId   Campaign ID
   * @param {Object} startKey     Start key, use empty string "" to scan from beginning
   * @param {Number} limit        Maximum records to return
   * @return {{Items: [SMSLogData], LastEvaluatedKey: Object}}
   */
  const getSmsLogData = useCallback(async (campaignId, startKey, limit) => {
    return await adminApiCall(() => {
      return async () => {
        const response = await axios.post(`${host}/api/v1/sms/campaigns/${campaignId}/log`,{startKey: startKey, limit:limit});
        return response.data;
      }
    });
  }, []);

  /**
   * @callback RestApiCall
   * @return {Promise<any>}
   */

  /**
   * @callback RestApiCallFactory
   * @return {RestApiCall}
   */

  /**
   * Execute a "protected" admin REST API call.
   *
   * Protected calls modify site content and require a valid OAuth token and permissions
   * in addition to an API key.
   *
   * If the original call throws an Auth error, attempts to refresh the auth token
   * and executes the call again.
   *
   * @param callFactory {RestApiCallFactory} Factory function returns a Promise which runs the API call and returns a result.
   * @returns {any} Response from Rest API call
   */
  async function adminApiCall(callFactory) {
    try {
      return await (callFactory())();
    } catch (error) {
      if (error.status === 401) {
        // auth error occurred
        if (refreshAuthTokenRef.current) {
          try {
            console.warn(`Auth token invalid. Refreshing...`);
            const newToken = await refreshAuthTokenRef.current.refreshAuthToken();
            axios.defaults.headers.common["Authorization"] = `Bearer ${newToken.access_token}`;
          } catch (err2) {
            console.error(`Error refreshing auth token.`, err2);
            // throw original error
            throw error;
          }
          // don't surround retry with try/catch, caller can catch the error
          console.debug(`Retrying REST API call.`);
          return await (callFactory())();
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  // receives refresh function from Auth module
  const refreshAuthTokenRef = useRef(null);

  return (
    <RestApiContext value={{
      Sites: {
        getSites: getSites,
        deleteSite: deleteSite,
        insertOrUpdateSite: insertOrUpdateSite,
        getSite: getSite,
        getSiteOutline: getSiteOutline,
        getSitemap: getSitemap,
      },
      Pages: {
        getPage: getPage,
        deletePage: deletePage,
        movePageAfter: movePageAfter,
        movePageBefore: movePageBefore,
        makePageChildOf: makePageChildOf,
        insertOrUpdatePage: insertOrUpdatePage,
        getPageSections: getPageSections,
        describePage: describePage,
      },
      PageSections: {
        insertOrUpdatePageSection: insertOrUpdatePageSection,
        generateSectionImages: generateSectionImages,
        deleteGeneratedImage: deleteGeneratedImage,
        uploadSectionImage: uploadSectionImage,
        deleteSectionImage: deleteSectionImage,
        deletePageSection: deletePageSection,
        describeSectionImage: describeSectionImage,
      },
      GuestBooks: {
        getGuestBook: getGuestBook,
        getGuestBooks: getGuestBooks,
        insertOrUpdateGuestBook: insertOrUpdateGuestBook,
        deleteGuestBook: deleteGuestBook,
        getGuest: getGuest,
        insertOrUpdateGuest: insertOrUpdateGuest,
        getGuestFeedback: getGuestFeedback,
        insertOrUpdateGuestFeedback: insertOrUpdateGuestFeedback,
        searchGuestBook: searchGuestBook,
        deleteGuest: deleteGuest,
      },
      Galleries: {
        getGallery: getGallery,
        getGalleries: getGalleries,
        getPhotos: getPhotos,
        insertOrUpdateGallery: insertOrUpdateGallery,
        deleteGallery: deleteGallery,
        uploadPhoto: uploadPhoto,
        updatePhoto: updatePhoto,
        deletePhoto: deletePhoto,
        describePhoto: describePhoto
      },
      Extras: {
        getSiteExtras: getSiteExtras,
        getPageExtras: getPageExtras,
        insertOrUpdateExtra: insertOrUpdateExtra,
        deleteExtra: deleteExtra,
        moveUp: moveExtraUp,
        moveDown: moveExtraDown,
        describeExtra: describeExtra,
      },
      Auth: {
        getAuthToken: getAuthToken,
        refreshToken: refreshToken,
        checkToken: checkToken,
        refreshAuthTokenRef: refreshAuthTokenRef,
        getAuthClients: getAuthClients,
        insertOrUpdateAuthClient: insertOrUpdateAuthClient,
        deleteAuthClient: deleteAuthClient,
      },
      Users: {
        getUsers: getUsers,
        getUser: getUser,
        insertOrUpdateUser: insertOrUpdateUser,
        deleteUser: deleteUser,
      },
      SMS: {
        getSmsCampaigns: getSmsCampaigns,
        getSmsCampaign: getSmsCampaign,
        deleteSmsCampaign: deleteSmsCampaign,
        getSmsCampaignSubscribers: getSmsCampaignSubscribers,
        insertOrUpdateSmsCampaign: insertOrUpdateSmsCampaign,
        getSmsSubscriber: getSmsSubscriber,
        insertOrUpdateSmsSubscriber: insertOrUpdateSmsSubscriber,
        deleteSmsSubscriber: deleteSmsSubscriber,
        insertOrUpdateSmsMessage: insertOrUpdateSmsMessage,
        getMmsFiles: getMmsFiles,
        uploadMmsFile: uploadMmsFile,
        deleteMmsFile: deleteMmsFile,
        sendSmsMessage: sendSmsMessage,
        deleteSmsMessage: deleteSmsMessage,
        getSmsWhitelist: getSmsWhitelist,
        insertOrUpdateSmsWhitelistEntry: insertOrUpdateSmsWhitelistEntry,
        deleteSmsWhitelistEntry: deleteSmsWhitelistEntry,
        getSmsMessages: getSmsMessages,
        getSmsMessage: getSmsMessage,
        getSmsMessageLog: getSmsMessageLog,
        getSmsCampaignLog: getSmsCampaignLog,
        getSmsLogData: getSmsLogData,
      }
    }}>
      {props.children}
    </RestApiContext>
  );
}

export function useRestApi() {
  return useContext(RestApiContext);
}

/**
 * Upload a file from a file input field to an S3 bucket.
 *
 * If 'prefix' 'counter' and 'extension' params are provided, the file will be auto-numbered.
 *
 * Otherwise, the original file name from the file field will be requested. If the name
 * contains uppercase letters, spaces, or special characters, they will be transformed.
 *
 * @param siteId {number}       SiteID the file belongs to. The site must have SiteBucketName defined or the request will fail.
 * @param file {File}           Form field containing file data.
 * @param path {string}         Path to the file, relative to site/bucket root, i.e. 'files/'. (Do not provide an initial slash.)
 * @param [prefix] {string}     Prefix for auto-numbering, along with 'extension'. File name format will be 'prefix0000.ext'
 * @param [counter] {string}    DynamoDB counter to use for auto-numbering, i.e. 'FileID', 'PhotoID'
 * @param [extension] {string}  Extension for auto-numbering, along with 'prefix'. File name format will be 'prefix0000.ext'
 * @param invalidate {string}   True to create an invalidation for the uploaded file. Don't use this for batch uploads, or a rate error will occur.
 * @returns {Promise<string>}   The S3 "key" (path + file name) to the uploaded file.
 */
async function uploadFileToS3({file, siteId, path, prefix, counter, extension, invalidate}) {
  /** @type {axios.AxiosResponse<PresignedUrlResponse>} */
  console.debug(`Upload file to S3...`)
  const urlResponse = await axios.post(`${host}/api/v1/content/files/url`, {
    SiteID: siteId,
    CloudFrontDistributionID: invalidate ? process.env.REACT_APP_CLOUDFRONT_DISTRIBUTION_ID : undefined,
    FilePath: path,
    FileName: (prefix && extension && counter) ? undefined : file.name, // send file name if not auto-numbering
    FilePrefix: prefix, // for auto-numbering
    FileCounter: counter, // for auto-numbering
    FileExt: extension, // for auto-numbering
  });
  console.debug(`Presigned URL response: ${JSON.stringify(urlResponse)}`);
  const uploadResponse = await fetch( // use fetch for sending raw form data
    urlResponse.data.PresignedUrl, {
      method: 'PUT',
      body: file, // Send the raw file data
      headers: {
        'Content-Type': file.type,
      }
    }
  );
  console.log(`S3 Upload response: ${JSON.stringify(uploadResponse)}`);
  return urlResponse.data.Key;
}

/**
 * Get the file extension to use for a given MIME type.
 *
 * @param mimeType {string} Mime type, i.e. 'image/jpg'
 * @returns {string} File extension to use, i.e. 'jpg'
 * @throws {Error} if the MIME type is unknown.
 */
export function getFileExtension(mimeType) {
  const entry = fileMap.find((entry) => entry.type === mimeType);
  if (entry) {
    return entry.extension;
  } else {
    throw new Error('Unsupported MIME type.');
  }
}

/**
 * Return the MIME type of the file based on the file name (extension).
 *
 * @param fileName {string} File name with extension, i.e. 'file.txt'
 * @returns {string} MIME type of the file, i.e. 'text/plain'
 * @throws {Error} if file name isn't formatted properly, or type is not found.
 */
export function getMimeType(fileName) {
  const parts = fileName.split('.');
  if (parts.length !== 2) {
    throw new Error(`Can't parse file name.`);
  }
  const extension = parts[parts.length - 1];
  const entry = fileMap.find((entry) => entry.extension === extension);
  if (entry) {
    return entry.type;
  } else {
    throw new Error('Unsupported file type.');
  }
}

/**
 * Map of extensions to MIME types.
 */
const fileMap = [
  {type: 'image/png', extension: 'png'},
  {type: 'image/gif', extension: 'gif'},
  {type: 'image/jpeg', extension: 'jpg'},
  {type: 'image/jpeg', extension: 'jpeg'},
  {type: 'image/svg+xml', extension: 'svg'},
  {type: 'image/webp', extension: 'webp'},
  {type: 'text/html', extension: 'html'},
  {type: 'text/html', extension: 'htm'},
  {type: 'text/plain', extension: 'txt'},
  {type: 'audio/mpeg', extension: 'mp3'},
  {type: 'audio/ogg', extension: 'ogg'},
  {type: 'audio/ogg', extension: 'oga'},
  {type: 'audio/wav', extension: 'wav'},
  {type: 'audio/webm', extension: 'weba'},
  {type: 'audio/mp4', extension: 'mp4a'},
  {type: 'video/mp4', extension: 'mp4'},
  {type: 'video/mp4', extension: 'm4v'},
  {type: 'video/webm', extension: 'webm'},
  {type: 'video/ogg', extension: 'ogv'},
  {type: 'video/x-msvideo', extension: 'avi'},
  {type: 'video/quicktime', extension: 'mov'},
  {type: 'video/mpeg', extension: 'mpeg'},
  {type: 'application/pdf', extension: 'pdf'},
]
