import {BsThreeDotsVertical} from "react-icons/bs";
import React from "react";

/**
 * @typedef MenuItem
 *
 * @property {String} label
 * @property {function()} action
 */

/**
 * Display a dropdown menu in an EditorPanel
 *
 * @param {[MenuItem]} menuItems
 * @returns {Element}
 * @constructor
 */
export default function EditorPanelMenu({menuItems}) {

  return <>{menuItems &&
    <div className="Editor EditorPanelMenu dropdown">
      <BsThreeDotsVertical
        data-bs-toggle="dropdown"
        aria-expanded="false"
      />
      <ul className="dropdown-menu Editor" style={{cursor: 'pointer'}}>
        {menuItems.map((menuItem) =>
          <li key={menuItem.label}>
            <button
              className="dropdown-item"
              onClick={menuItem.action}>{menuItem.label}</button>
          </li>
        )}
      </ul>
    </div>
  }</>;
}