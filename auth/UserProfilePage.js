import {lazy, Suspense} from "react";
import RestrictedContent from "./RestrictedContent";
import {useAuth} from "./AuthProvider";

const UserProfilePanel = lazy(() => import("./UserProfilePanel"));

/**
 * Return page content for an SMS admin page.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function SmsAdminPage() {

  const {isAuthenticated} = useAuth();

  return <>{isAuthenticated ? <div className={'PageContent'}>
      <Suspense><UserProfilePanel/></Suspense>
    </div>
    :
    <RestrictedContent/>
  }</>;
}