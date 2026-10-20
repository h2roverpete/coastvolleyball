/**
 * Permissions declarations and utility for checking user permissions.
 *
 * Note, this module is declared with universal syntax to be compatible with
 * ESM or CJS projects.
 */

/**
 * Resource types.
 * @enum {string}
 */
const Resource = {
  SITE: "site",
  PAGE: "page",
  GALLERY: "gallery",
  GUESTBOOK: "guestbook",
  USERS: "users",
  SMS: "sms",
}

/**
 * Resource permissions.
 * @enum {string}
 */
const Permission = {
  ADMIN: "admin",
  EDIT: "edit",
  BROWSE_PROTECTED: "browse_protected",
  BROWSE: "browse",
  UPDATE: "update",
  ADD: "add",
  DELETE: "delete",
  SEND: "send",
  NONE: "none",
}

/**
 * Map of resources to their associated permissions.
 * Permissions lists are hierarchical, meaning that if a permission
 * is declared first, it includes and supersedes all subsequent permissions.
 */
const ResourcePermissions = {
  [Resource.SITE]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Site Outline'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.PAGE]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Page Contents'},
    {permission: Permission.BROWSE_PROTECTED, description: 'Browse Protected Pages'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.GALLERY]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.EDIT, description: 'Edit Gallery Contents'},
    {permission: Permission.ADD, description: 'Add Photos'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.GUESTBOOK]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.BROWSE, description: 'Browse Only'},
  ],
  [Resource.USERS]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.NONE, description: 'None'},
  ],
  [Resource.SMS]: [
    {permission: Permission.ADMIN, description: 'Administrator'},
    {permission: Permission.SEND, description: 'Send Messages'},
  ]
}

/**
 * Check if the provided user has permission to access
 * the specified resource at the permission level provided.
 *
 * @param user {UserData}       User to check permissons for.
 * @param resource {string}     Resource, i.e. Resource.SITE or Resource.PAGE
 * @param permission {string}   Permission level requested, i.e. Permission.ADMIN
 *
 * @returns {boolean}   True if the user has permission
 */
const checkPermission = (user, resource, permission) => {
  const permissionList = ResourcePermissions[resource];
  if (permissionList) {
    const requestedIndex = permissionList.findIndex((item) => item.permission === permission);
    let userIndex = -1;
    switch (resource) {
      case Resource.SITE:
        userIndex = permissionList.findIndex((item) => item.permission === user.SitePermission);
        break;
      case Resource.PAGE:
        userIndex = permissionList.findIndex((item) => item.permission === user.PagePermission);
        break;
      case Resource.GALLERY:
        userIndex = permissionList.findIndex((item) => item.permission === user.GalleryPermission);
        break;
      case Resource.GUESTBOOK:
        userIndex = permissionList.findIndex((item) => item.permission === user.GuestBookPermission);
        break;
      case Resource.USERS:
        userIndex = permissionList.findIndex((item) => item.permission === user.UserPermission);
        break;
      case Resource.SMS:
        userIndex = permissionList.findIndex((item) => item.permission === user.SmsPermission);
        break;
      default:
        break;
    }
    const canEdit = userIndex >= 0 && requestedIndex >= 0 && userIndex <= requestedIndex;
    console.debug(`Permission for ${resource}:${permission} = ${canEdit}.`);
    return canEdit;
  } else {
    console.error(`Unknown resource ${resource}.`);
    return false;
  }
}

module.exports = {
  Resource: Resource,
  Permission: Permission,
  ResourcePermissions: ResourcePermissions,
  checkPermission: checkPermission,
}

