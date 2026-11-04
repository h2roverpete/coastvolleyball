import {Button, Col, Form, Row, Spinner} from "react-bootstrap";
import {useState} from "react";
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
            // token is current, check page ID
            return decoded.PageID === pageData.PageID
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
    <div className={'PageSection'}>
      Please enter the password to view this page.
    </div>
    <Form>
      <Row>
        <Col sm={4} className={'mt-2'}>
          <Form.Control
            type={'password'}
            autoComplete={'password'}
            name={'PagePassword'}
            isInvalid={passwordError?.length}
            value={password}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSubmit();
              } else {
                setPasswordError(null);
              }
            }}
            disabled={busy}
            onChange={(event) => {
              setPassword(event.target.value)
            }}
          />
          <div className={'small text-danger mt-1'}>{passwordError}</div>
        </Col>
        <Col sm={2} className={'mt-2'}>
          <Button
            className="me-2"
            variant="primary"
            onClick={() => onSubmit()}
            disabled={!password.length || busy}
          >
            <div style={{display: 'grid', placeItems: 'center'}}>
              <div style={{
                gridArea: '1/1',
                visibility: !busy ? 'visible' : 'hidden'
              }}>Log In
              </div>
              <Spinner size="sm" style={{gridArea: '1/1', visibility: busy ? 'visible' : 'hidden'}}/>
            </div>
          </Button>
        </Col>
      </Row>
    </Form>
  </div>
}