import {useEffect} from "react";
import {useAuth} from "./AuthProvider";
import {useNavigate} from "react-router";

export default function Logout(props) {
  const {token,  setToken} = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      console.debug(`Log out.`);
      setToken(null);
    } else {
      console.debug(`Log out: no current token.`);
    }
    navigate('/');
  }, [token, navigate, setToken]);
  return (<></>);
}