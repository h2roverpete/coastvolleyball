import {useContext} from "react";
import {SiteContext} from "./Site";

/**
 * Insert a copyright element.
 *
 * Style: A <div> element with class name "Copyright"
 *
 * @property {string} [startYear]   Starting year for copyright.
 * @property {string} [siteName]    Override site name in content configuration.
 
 * @returns {JSX.Element}
 * @constructor
 */
function Copyright({startYear, siteName}) {

  const {siteData} = useContext(SiteContext);

  return (
    <div className="Copyright">
      &copy;{startYear ? `${startYear}-` : ''}{new Date().getFullYear()} {siteName ? siteName : siteData?.SiteName}.<br/>All
      rights
      reserved.
    </div>
  )
}

export default Copyright;