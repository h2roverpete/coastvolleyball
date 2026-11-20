import {useAuth} from "./AuthProvider";
import FormEditor from "../ui/editor/FormEditor";
import {useRestApi} from "../api/RestApi";
import {Container} from "react-bootstrap";
import {lazy, Suspense, useEffect, useState} from "react";
import {useNavigate} from "react-router";

const UserFields = lazy(() => import("./UserFields"));
const RestrictedContent = lazy(() => import("./RestrictedContent"));

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserProfilePanel() {

  const {isAuthenticated, currentUser} = useAuth();
  const [user, setUser] = useState(null);
  const [resetPassword, setResetPassword] = useState(false);
  const {Users} = useRestApi();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && currentUser) {
      // always load user data from database, don't use token
      Users.getUser(currentUser.UserID).then((result) => {
        if (result.MagicLink) {
          // set flag to reset password
          setResetPassword(true);
          delete result.MagicLink;
        }
        setUser(result);
      });
    }
  }, [user, currentUser, Users])

  function handleUpdate() {
    if (resetPassword) {
      setResetPassword(false);
      navigate('/');
    }
  }

  return (<>
    {isAuthenticated ? <Suspense>
      {user &&
        <Container className="PageSection">
          <FormEditor>
            <UserFields data={user} resetPassword={resetPassword} onUpdate={handleUpdate}/>
          </FormEditor>
        </Container>
      }
    </Suspense> : <RestrictedContent/>}
  </>);
}