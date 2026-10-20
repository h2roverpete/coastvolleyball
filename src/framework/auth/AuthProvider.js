import {useContext, createContext, useState, useEffect, useImperativeHandle, useCallback} from "react";
import {useCookies} from 'react-cookie';
import {useRestApi} from "../api/RestApi";
import {jwtDecode} from 'jwt-decode';
import {checkPermission} from "./Permissions";

export const AuthContext = createContext({});

export default function AuthProvider(props) {

  const [cookies, setCookie] = useCookies();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {Auth} = useRestApi();

  useEffect(() => {
    setIsAuthenticated(cookies.token && user);
  }, [cookies.token, user, setIsAuthenticated]);

  useImperativeHandle(Auth.refreshAuthTokenRef, () => {
    return {
      refreshAuthToken: refreshAuthToken,
    }
  });

  /**
   * Check if the current user has the requested permission.
   * Fails until token is verified and current user is set.
   *
   * @param resource {string}     Resource being checked, i.e. Resource.PAGE, Resource.SITE, etc.
   * @param permission {string}   Permission being checked, i.e. Permission.ADMIN, etc.
   *
   * @returns {boolean} True if the user is logged in and has permission.
   */
  const hasPermission = useCallback((resource, permission) => {
    console.debug(`Check permission '${resource}:${permission}' for current user.`);
    if (user) {
      if (user.SiteID !== '0' && user.SiteID !== process.env.REACT_APP_SITE_ID) {
        console.error(`User not authorized for this site.`);
        return false;
      } else {
        return checkPermission(user, resource, permission);
      }
    } else {
      console.debug(`User not logged in.`);
      return false;
    }
  }, [user]);

  const setToken = useCallback((newToken) => {
    console.debug(`Set token: ${JSON.stringify(newToken)}`);
    // update token value
    setCookie('token', newToken);
    if (newToken) {
      // decode token and set user
      const decoded = jwtDecode(newToken.access_token);
      setUser(decoded);
    } else {
      // clear user
      setUser(null);
    }
  }, [setCookie, setUser]);

  /**
   * Refresh expired auth token.
   * @type {(function(): Promise<*|null>)|*}
   */
  const refreshAuthToken = useCallback(async () => {
    if (cookies.token?.refresh_token) {
      console.debug(`Refreshing auth token...`);
      const newToken = await Auth.refreshToken(cookies.token.refresh_token, window.location.host);
      setToken(newToken);
      return newToken;
    } else {
      return null;
    }
  }, [Auth, setToken, cookies.token?.refresh_token]);

  const validateToken = useCallback(async () => {
    try {
      console.debug(`Validating access token...`);
      await Auth.checkToken();
      const decoded = jwtDecode(cookies.token.access_token);
      setUser(decoded);
      console.debug(`Access token is valid, setting user.`);
    } catch (error) {
      if (error.status === 401) {
        try {
          // token refused, try refreshing
          await refreshAuthToken()
        } catch (error) {
          console.error(`Error refreshing token: ${JSON.stringify(error)}`);
        }
      } else {
        console.error(`Unknown error checking token: ${JSON.stringify(error)}`);
      }
    }
  }, [Auth, setUser, refreshAuthToken, cookies.token?.access_token]);

  useEffect(() => {
    if (cookies.token) {
      validateToken().then();
    }
  }, [cookies.token, validateToken]);


  return (
    <AuthContext
      value={{
        token: cookies.token,
        setToken: setToken,
        hasPermission: hasPermission,
        isAuthenticated: isAuthenticated,
        refreshAuthToken: refreshAuthToken,
        currentUser: user,
      }}>
      {props.children}
    </AuthContext>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};