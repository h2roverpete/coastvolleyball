import SiteConfigPanel from "./SiteConfigPanel";
import PageConfigPanel from "./PageConfigPanel";

export default function SiteEditor({children}) {
  return (
    <div
      className="SiteEditor"
    >
      <SiteConfigPanel />
      <PageConfigPanel />
      {children}
    </div>
  )
}