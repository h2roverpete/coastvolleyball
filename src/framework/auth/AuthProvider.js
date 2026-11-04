import {useContext, createContext, useState, useEffect, useImperativeHandle, useCallback} from "react";
import {useCookies} from 'react-cookie';
import {useRestApi} from "../api/RestApi";
import {jwtDecode} from 'jwt-decode';
import {checkPermission} from "./Permissions";

export const AuthContext = createContext({});

export default function AuthProvider(props) {

  const [cookies, setCookie, removeCookie] = useCookies();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {Auth} = useRestApi();
  const siteId = parseInt(process.env.REACT_APP_SITE_ID);

  useEffect(() => {
    if (cookies.token && !currentUser) {
      // set up initial state
      setIsAuthenticated(true);
      setCurrentUser(jwtDecode(cookies.token.access_token));
    }
  },[]);

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
    if (currentUser) {
      if (currentUser.SiteID !== 0 && currentUser.SiteID !== siteId) {
        return false;
      } else {
        return checkPermission(currentUser, resource, permission);
      }
    } else {
      return false;
    }
  }, [currentUser, siteId]);

  const setToken = useCallback((newToken) => {
    // update token value
    if (newToken) {
      setCookie('token', newToken);
      setCurrentUser(jwtDecode(newToken.access_token));
      setIsAuthenticated(true);
    } else {
      removeCookie('token', newToken);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  }, [setCookie, setCurrentUser]);

  /**
   * Refresh expired auth token.
   * @type {(function(): Promise<*|null>)|*}
   */
  const refreshAuthToken = useCallback(async () => {
    if (cookies.token?.refresh_token) {
      const newToken = await Auth.refreshToken(cookies.token.refresh_token, window.location.host);
      setToken(newToken);
      return newToken;
    } else {
      return null;
    }
  }, [Auth, setToken, cookies.token?.refresh_token]);

  const validateToken = useCallback(async () => {
    try {
      await Auth.checkToken();
      const decoded = jwtDecode(cookies.token.access_token);
      setCurrentUser(decoded);
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
  }, [Auth, setCurrentUser, refreshAuthToken, cookies.token?.access_token]);

  return (
    <AuthContext
      value={{
        token: cookies.token,
        setToken: setToken,
        hasPermission: hasPermission,
        isAuthenticated: isAuthenticated,
        refreshAuthToken: refreshAuthToken,
        currentUser: currentUser,
      }}>
      {props.children}
    </AuthContext>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};