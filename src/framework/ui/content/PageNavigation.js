import {useNavigate} from "react-router";
import {useSiteContext} from "./Site";
import './PageNavigation.css';

/**
 * Display next/previous page navigation elements.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageNavigation({html}) {

  const {nextPage, prevPage} = useSiteContext();
  const navigate = useNavigate();

  return (
    <div
      className="PageNavigation"
    >
      {html && <div dangerouslySetInnerHTML={{__html: html}} className={'nav-text'}/>}
      {prevPage && (
        <div
          className="nav nav-item nav-link previous"
          style={{cursor: "pointer"}}
          onClick={() => navigate(prevPage.PageRoute)}
        >
          {prevPage.NavTitle ? prevPage.NavTitle : prevPage.PageTitle}
        </div>
      )}
      <span style={{flexGrow: 1}}></span>
      {
        nextPage && (
          <div
            className="nav nav-item nav-link next"
            style={{cursor: "pointer"}}
            onClick={() => navigate(nextPage.PageRoute)}
          >
            {nextPage.NavTitle ? nextPage.NavTitle : nextPage.PageTitle}
          </div>
        )
      }
    </div>
  )
}