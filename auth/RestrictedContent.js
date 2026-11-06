import {Button} from "react-bootstrap";
import {useAuth} from "./AuthProvider";
import {useNavigate} from "react-router";

/**
 * Display a page section div displaying that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function RestrictedContent() {
  const navigate = useNavigate();
  const {isAuthenticated} = useAuth();
  return (
    <div className="PageSection">
      <p>You don't have permission to access this page.</p>
      <div className={'d-flex'}>
        {!isAuthenticated && (<Button onClick={() => navigate('/login')}>Log In</Button>)}
      </div>
    </div>
  );
}