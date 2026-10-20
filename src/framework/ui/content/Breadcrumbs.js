import {useSiteContext} from "./Site";
import {usePageContext} from "./Page";
import './Breadcrumbs.css';

/**
 * Display breadcrumb trail in site navigation.
 *
 * @property {string} [delimiter]   Delimiter to use between pages.
 * @returns {JSX.Element}
 * @constructor
 */
export default function Breadcrumbs({delimiter}) {

  const {siteData} = useSiteContext();
  const {breadcrumbs} = usePageContext();

  return (<>{breadcrumbs?.length > 0 && (
    <ol className="breadcrumb">
      <li className="breadcrumb-item">{siteData?.SiteName}</li>
      {breadcrumbs.map(page => (
        <li key={page.PageID} className="breadcrumb-item">
          {page.NavTitle ? page.NavTitle : page.PageTitle}
        </li>
      ))}
    </ol>
  )}</>);
}
