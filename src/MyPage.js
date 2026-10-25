import NavBar from "framework/ui/content/NavBar";
import PageContent from "framework/ui/content/PageContent";
import PageTitle from "framework/ui/content/PageTitle";
import PageSections from "framework/ui/content/PageSections";
import PageSwiper from "framework/ui/content/PageSwiper";
import Logo from "./Logo";
import {useSiteContext} from "framework/ui/content/Site";
import Breadcrumbs from "framework/ui/content/Breadcrumbs";
import PageNavigation from "framework/ui/content/PageNavigation";

/**
 * Component for site-specific page contents.
 * Customize as needed with all the page elements.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function MyPage() {
  const {siteData} = useSiteContext();
  return (<>
    <NavBar brand={siteData?.SiteName} icon={'/images/volleyball.svg'} expand={'md'} showLogin/>
    <PageSwiper>
      <PageContent>
        <Breadcrumbs/>
        <PageTitle/>
        <PageSections/>
      </PageContent>
    </PageSwiper>
    <PageNavigation/>
  </>)
}