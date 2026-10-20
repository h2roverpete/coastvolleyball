import PageTitle from "../ui/content/PageTitle";
import {Button} from "react-bootstrap";
import {useAuth} from "./AuthProvider";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function RestrictedContent() {
  const {isAuthenticated} = useAuth();
  return (
    <div className="PageContent container-fluid">
      <PageTitle text={"Restricted Content"}/>
      <div className="PageSection">
        <p>You don't have permission to access this page.</p>
        {!isAuthenticated && (<Button href={'/login'}>Log In</Button>)}
      </div>
    </div>
  );
}