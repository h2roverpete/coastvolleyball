import {useAuth} from "./AuthProvider";
import RestrictedContent from "./RestrictedContent";
import FormEditor from "../ui/editor/FormEditor";
import UserFields from "./UserFields";
import EditorButtons from "../ui/editor/EditorButtons";
import {useRestApi} from "../api/RestApi";
import {useSiteContext} from "../ui/content/Site";
import {isValidEmail, isValidPassword} from "../util/Validators"
import {Container} from "react-bootstrap";
import {useEffect, useState} from "react";

/**
 * Display message that the user doesn't have permission to view the content.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserProfilePanel() {

  const {isAuthenticated, currentUser} = useAuth();
  const [user, setUser] = useState(null);
  const {Users} = useRestApi();

  useEffect(() => {
    if (!user && currentUser) {
      // always load user data from database, don't use token
      Users.getUser(currentUser.UserID).then((result) => {
        setUser(result);
      });
    }
  }, [currentUser, Users])

  return (<>
    {isAuthenticated ? <>
      {user &&
        <Container className="PageSection">
          <FormEditor>
            <UserFields data={user}/>
          </FormEditor>
        </Container>
      }
    </> : <RestrictedContent/>}
  </>);
}