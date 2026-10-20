import './css/App.css';
import "bootstrap/scss/bootstrap.scss";

import Site from "framework/ui/content/Site";
import MyPage from "./MyPage";
import React from "react";
import FrameworkApp from "framework/FrameworkApp";

/**
 * Wraps the Site component in the framework dependencies
 * and specifies the component the Site uses to render pages.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function App() {
  return (
    <FrameworkApp>
      <Site pageElement={MyPage}/>
    </FrameworkApp>
  )
}
