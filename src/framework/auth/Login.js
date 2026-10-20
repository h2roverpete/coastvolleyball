import {useEffect, useRef, useState} from "react";
import '../ui/forms/Forms.css'
import PasswordField from "../ui/forms/PasswordField";
import {useSearchParams} from 'react-router';
import {useSiteContext} from "../ui/content/Site";
import {useNavigate} from "react-router";
import {useAuth} from "./AuthProvider";
import {useCookies} from "react-cookie";
import {useRestApi} from "../api/RestApi";
import {Button, Col, Form, Row} from "react-bootstrap";
import {isValidEmail, isValidPassword} from "../util/Validators";

/**
 * Login UI component.
 *
 * @returns {JSX.Element}
 * @constructor
 */
const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const scope = 'profile email phone'

  const {Auth} = useRestApi();
  const {setError} = useSiteContext();
  const [searchParams] = useSearchParams();
  const {token, setToken} = useAuth();
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();

  useEffect(() => {
    if (!cookies.loginState) {
      const state = generateState();
      setCookie("loginState", state);
    }
  }, [cookies.loginState, setCookie]);

  useEffect(() => {
    if (token) {
      // token already set
      navigate('/');
    }
  }, [token, navigate])

  const [loginResponse, setLoginResponse] = useState(false);
  useEffect(() => {
    setLoginResponse(searchParams.get('state') !== null && searchParams.get('code') !== null);
  }, [searchParams]);

  const fetchingToken = useRef(false); // prevent double fetch of token
  useEffect(() => {
    // process login response
    if (loginResponse && !token && !fetchingToken.current) {
      fetchingToken.current = true;
      // check received state against state originally sent
      if (cookies.loginState !== searchParams.get('state')) {
        setError({
          title: 'Invalid login state',
          description: "Couldn't verify login state.",
        })
        setCookie("loginState", null);
      } else {
        Auth.getAuthToken(
          window.location.host,
          `${window.location.protocol}//${window.location.host}/login`,
          searchParams.get('code')
        ).then((token) => {
            // successful token retrieval
            setToken(token);
            navigate('/');
          }
        ).catch((error) => {
            setError({
              title: `${error.status} Login Error`,
              description: `Couldn't retrieve token. Code=${error.code}`
            });
          }
        );
      }
    }
  }, [Auth, cookies.loginState, navigate, searchParams, setCookie, setError, setToken, token, loginResponse]);

  return (
    <>
      {loginResponse ? (
        // process login response
        <p>Processing login...</p>
      ) : (
        // display login form
        <div className="Login container-fluid">
          <form method="POST" action={`${process.env.REACT_APP_BACKEND_HOST}/oauth/login`}>
            <input type="hidden" name="response_type" value="code"/>
            <input type="hidden" name="client_id" value={window.location.host}/>
            <input type="hidden" name="redirect_uri"
                   value={`${window.location.protocol}//${window.location.host}/login`}/>
            <input type="hidden" name="state" value={cookies.loginState ? cookies.loginState : ''}/>
            <input type="hidden" name="scope" value={scope}/>
            <Row className="mt-4">
              <Form.Label className={'required'} htmlFor="email" column={true} sm={3}>
                Email
              </Form.Label>
              <Col sm={6}>
                <Form.Control
                  name="email"
                  id="email"
                  autoComplete="email"
                  isValid={email?.length > 0 && isValidEmail(email)}
                  isInvalid={email?.length > 0 && !isValidEmail(email)}
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Col>
            </Row>
            <Row className={'mt-2'}>
              <Form.Label className={'required'} htmlFor="password" column={true} sm={3}>
                Password
              </Form.Label>
              <Col sm={6}>
                <PasswordField
                  name={"password"}
                  id={"password"}
                  value={password || ''}
                  isValid={password?.length > 0 && isValidPassword(password)}
                  isInvalid={password?.length > 0 && !isValidPassword(password)}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Col>
            </Row>

            <div className="form-group mt-4">
              <Button type="submit" variant="primary" disabled={!email || !password}>Log In</Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Login;

/**
 * Generate a random state string.
 * @returns {string}
 */
function generateState() {
  const randomBytes = new Uint8Array(128); // 32 bytes for a strong verifier
  crypto.getRandomValues(randomBytes);
  return base64UrlEncode(randomBytes);
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
