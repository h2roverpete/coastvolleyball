import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useRef, useState} from "react";
import {useCookies} from "react-cookie";
import {useRestApi} from "../../api/RestApi";
import {jwtDecode} from "jwt-decode";

export default function PagePassword({pageData, onSuccess, apiRef}) {

  const {Pages} = useRestApi();
  const [cookies, setCookie] = useCookies();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function canView() {
    if (pageData && cookies && Pages) {
      const token = cookies[`page${pageData.PageID}token`];
      if (token) {
        // decode token and validate
        const decoded = await jwtDecode(token.access_token);
        if (decoded) {
          const t = Math.floor(Date.now() / 1000);
          if (decoded.exp > t) {
            // token is current, check page ID and password
            return decoded.PageID === pageData.PageID && decoded.PagePassword === pageData.PagePassword;
          } else {
            try {
              const newToken = await Pages.refreshPageToken(pageData.PageID, token.refresh_token);
              setCookie(`page${pageData.PageID}token`, newToken);
              return true;
            } catch (err) {
              // refresh error
              return false;
            }
          }
        }
      }
    }
    return false;
  }

  if (apiRef) {
    apiRef.current = {
      canView: canView,
    }
  }

  function onSubmit() {
    setBusy(true);
    Pages.loginToPage(pageData.PageID, password).then((result) => {
      setCookie(`page${pageData.PageID}token`, result);
      setPasswordError(null);
      onSuccess(result);
      setBusy(false);
    }).catch(() => {
      setPasswordError(`Invalid password.`);
      setBusy(false);
    })
  }

  return <div className="PageContent">
    <h1 className={'SectionTitle'}>Restricted Content</h1>
    <Row>
      <Form.Label
        htmlFor={'PagePassword'}
        column={'sm'}
        className='col-sm-12'
      >
        Please enter the password to view this page.
      </Form.Label>
      <Col sm={4} className={'mt-3'}>
        <Form.Control
          size={'sm'}
          type={'password'}
          name={'PagePassword'}
          isInvalid={passwordError?.length}
          value={password}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSubmit();
            }
          }}
          onChange={(event) => {setPassword(event.target.value)}}
        />
        <div className={'small text-danger mt-1'}>{passwordError}</div>
      </Col>
      <Col sm={2} className="mt-3">
        <Button
          size={'sm'}
          style={{width: '75px'}}
          onClick={() => onSubmit()}
          disabled={!password.length}
        >
          {busy ? <Spinner size={'sm'}/> : <>Log In</>}
        </Button>
      </Col>
    </Row>
  </div>
}