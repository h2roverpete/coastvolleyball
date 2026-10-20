/**
 * Is the provided string a valid email address?
 *
 * @param email {string}  Email to test.
 *
 * @returns {boolean} Is a valid email?
 */
export function isValidEmail(email) {
  return email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Is the provided string a valid phone number? (including country code)
 *
 * @param phone {string}  Email to test.
 *
 * @returns {boolean} Is a valid phone number?
 */
export function isValidPhoneNumber(phone) {
  const number = phone?.replaceAll(/[^0-9+]/g, "");
  return (number?.length === 12 && number.startsWith('+1'));
}

/**
 * Is the provided string a valid URL?
 * (Includes IP addresses and localhost URLs)
 *
 * @param url {string}  URL to test.
 *
 * @returns {boolean} Is a valid URL?
 */
export function isValidUrl(url) {
  return url && /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/.test(url);
}

/**
 * Does a password meet minimum criteria?
 *
 * - 8-40 characters long
 * - One lowercase, one uppercase, one number, one symbol
 *
 * @param password {string} Password to test.
 *
 * @returns {boolean} Does it meet criteria?
 */
export function isValidPassword(password) {
  return password && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,40}$/.test(password);
}

/**
 * Is the provided string a valid S3 bucket name?
 *
 * @param bucketName {string}   String to test.
 * @returns {boolean} Is a valid bucket name?
 */
export function isValidBucketName(bucketName) {
  return bucketName && /[a-z.]*/.test(bucketName);
}

export function isValidInstagramHandle(handle) {
  return handle && /^@[a-zA-Z0-9\-_.]+$/.test(handle);
}

export function isValidYouTubeUrl(url) {
  return url && /^https:\/\/www.youtube.com\/watch\?v=/.test(url);
}

export function isValidRoute(pageData, outlineData) {
  if (!pageData.PageRoute || pageData.PageRoute.charAt(0) !== '/' || pageData.PageRoute.match(/^\/[a-z0-9]+$/) === null) {
    return false;
  }
  for (const page of outlineData) {
    if (page.PageRoute === pageData.PageRoute && pageData.PageID !== page.PageID) {
      return false;
    }
  }
  return true;
}