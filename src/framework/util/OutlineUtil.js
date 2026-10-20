/**
 * Utility routines for modifying a site outline.
 */

/**
 * Refresh a page in the site outline.
 *
 * @param {OutlineData} pageData        Page to refresh
 * @param {OutlineData[]} outlineData   Site outline
 *
 * @returns {OutlineData[]}
 */
export const updatePage = (pageData, outlineData) => {
  if (outlineData) {
    const newOutlineData = outlineData.map((item) => {
      if (item.PageID === pageData.PageID) {
        return {...pageData};
      } else {
        return item;
      }
    })
    return buildOutline(newOutlineData);
  }
};

/**
 * Delete a page from the outline.
 *
 * @param pageData {OutlineData}        Page to add.
 * @param outlineData {OutlineData[]}   Site outline.
 *
 * @returns {OutlineData[]}
 */
export const deletePage = (pageData, outlineData) => {
  if (outlineData) {
    const newOutlineData = outlineData.filter((item) => item.PageID !== pageData.PageID);
    return buildOutline(newOutlineData);
  }
};

/**
 * Add a page to the outline.
 *
 * @param pageData {OutlineData}        Page to add.
 * @param outlineData {OutlineData[]}   Site outline.
 *
 * @returns {OutlineData[]}
 */
export const addPage = (pageData, outlineData) => {
  if (outlineData && pageData) {
    console.debug(`Add page ${pageData.PageID} to outline.`)
    const newOutlineData = [...outlineData, pageData];
    return buildOutline(newOutlineData);
  }
};

/**
 * Move one page before another in the outline.
 *
 * @param pageData {OutlineData}        Page being moved.
 * @param beforePageData {OutlineData}  Page to be after the page being moved.
 * @param outlineData {OutlineData[]}   Site outline.
 *
 * @returns {OutlineData[]}
 */
export const movePageBefore = (pageData, beforePageData, outlineData) => {
  console.debug(`Move page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' before '${beforePageData.PageTitle} (${beforePageData.ParentID},${beforePageData.OutlineSeq})'`);
  const newOutlineData = outlineData.map((item) => {
    if (item.PageID === pageData.PageID) {
      const changedItem = {...item};
      changedItem.OutlineSeq = beforePageData.OutlineSeq;
      changedItem.ParentID = beforePageData.ParentID;
      changedItem.OutlineLevel = beforePageData.OutlineLevel;
      return changedItem;
    } else if (item.ParentID === beforePageData.ParentID && item.OutlineSeq >= beforePageData.OutlineSeq) {
      // increment outline sequence
      const changedItem = {...item};
      changedItem.OutlineSeq++;
      return changedItem;
    } else {
      // no change
      return item;
    }
  });
  return buildOutline(newOutlineData);
};

/**
 * Move one page after another in the outline.
 *
 * @param pageData {OutlineData}        Page being moved.
 * @param afterPageData {OutlineData}   Page to be before the page being moved.
 * @param outlineData {OutlineData[]}   Site outline.
 *
 * @returns {OutlineData[]}
 */
export const movePageAfter = (pageData, afterPageData, outlineData) => {
  console.debug(`Move page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' after '${afterPageData.PageTitle} (${afterPageData.ParentID},${afterPageData.OutlineSeq})'`);
  const newOutlineData = outlineData.map((item) => {
    if (item.PageID === pageData.PageID) {
      const changedItem = {...item};
      changedItem.OutlineSeq = afterPageData.OutlineSeq + 1;
      changedItem.ParentID = afterPageData.ParentID;
      changedItem.OutlineLevel = afterPageData.OutlineLevel;
      return changedItem;
    } else if (item.ParentID === afterPageData.ParentID && item.OutlineSeq > afterPageData.OutlineSeq) {
      // increment outline sequence
      const changedItem = {...item};
      changedItem.OutlineSeq++;
      return changedItem;
    } else {
      // no change
      return item;
    }
  });
  return buildOutline(newOutlineData);
};

/**
 * Make one page the first child of another page.
 *
 * @param pageData {OutlineData}          New child page.
 * @param parentPageData {OutlineData}    Parent page.
 * @param outlineData {OutlineData[]}     Site outline.
 *
 * @returns {OutlineData[]}
 */
export const makeChildOf = (pageData, parentPageData, outlineData) => {
  console.debug(`Make page '${pageData.PageTitle} (${pageData.ParentID},${pageData.OutlineSeq})' child of '${parentPageData.PageTitle} (${parentPageData.ParentID},${parentPageData.OutlineSeq})'`);
  const newOutlineData = outlineData.map((item) => {
    if (item.PageID === pageData.PageID) {
      const changedItem = {...item};
      changedItem.OutlineSeq = 1;
      changedItem.ParentID = parentPageData.PageID;
      changedItem.OutlineLevel = parentPageData.OutlineLevel + 1;
      return changedItem;
    } else if (item.ParentID === parentPageData.PageID) {
      // increment outline sequence
      const changedItem = {...item};
      changedItem.OutlineSeq++;
      return changedItem;
    } else {
      // no change
      return item;
    }
  });
  return buildOutline(newOutlineData);
};

/**
 * Retrieve child pages of the specified page.
 *
 * @param pageId {number}                 Page ID to get children from.
 * @param outlineData {[OutlineData]}     Outline data
 * @param [showHidden] {boolean}          Return hidden pages? (default=false)
 * @param [canBrowseProtected] {boolean}  Can browse protected pages? (default=false)
 * @returns {[OutlineData]}               Children, or an empty array if no child pages.
 */
export function getChildren(pageId, outlineData, showHidden, canBrowseProtected) {
  const result = [];
  if (outlineData) {
    outlineData.map((item) => {
      if (item.ParentID === pageId && ((!item.PageHidden) || showHidden) && (!item.RequiresLogin || canBrowseProtected)) {
        result.push(item);
      }
      return item;
    })
  }
  return result;
}

/**
 * Recursive function to build or rebuild the site outline in the proper sequence
 * using only the parent/child relationships and OutlineSeq values.
 *
 * @param pages {[OutlineData]}   Array of page data (arbitrary sort order)
 * @param [parentId] {number}     Parent page ID.
 * @param [level] {number}        Level number, also a trigger to recurse through all children.
 * @param [parent] {OutlineData}  Parent data.
 * @returns {[OutlineData]}       Outline built from page data
 */
function buildOutline(pages, parentId, level, parent) {
  parentId = parentId ? parentId : 0;
  level = level ? level : 0;
  let result = [];
  pages.map((page) => {
    if (page.ParentID === parentId) {
      // copy outline data fields
      const child = {
        ...page,
        HasChildren: false, // will be reset to true if children are found
        OutlineLevel: level,
        OutlineSort: setCharAt(parent ? parent.OutlineSort : '0'.repeat(20), level * 2, page.OutlineSeq.toString().padStart(2, "0"))
      }
      result.push(child);
      result = result.concat(buildOutline(pages, child.PageID, level + 1, child));
    }
    return true; // make eslint happy
  })
  if (result.length > 0 && parent) parent.HasChildren = true;
  result.sort((a, b) => a.OutlineSort.localeCompare(b.OutlineSort));
  return result;
}

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

export const Outline = {
  updatePage: updatePage,
  deletePage: deletePage,
  addPage: addPage,
  movePageBefore: movePageBefore,
  movePageAfter: movePageAfter,
  makeChildOf: makeChildOf,
  getChildren: getChildren,
};