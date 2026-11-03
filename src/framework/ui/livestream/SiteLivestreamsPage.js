import PageContent from "../content/PageContent";
import {useSiteContext} from "../content/Site";
import LivestreamList from "./LivestreamList";

export default function SiteLivestreamsPage() {
  const {siteData} = useSiteContext();
  return <PageContent>
    <LivestreamList siteId={siteData?.SiteID}/>
  </PageContent>
}