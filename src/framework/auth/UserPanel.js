import {Col, Container, Row} from "react-bootstrap";
import {ResourcePermissions} from "./Permissions";
import {useEffect, useState} from "react";
import {useSiteContext} from "../ui/content/Site";
import {useRestApi} from "../api/RestApi";

/**
 *
 * @param {NewUserData} data
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserPanel({data}) {

  const [site, setSite] = useState(null);
  const {Sites} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  useEffect(() => {
    if (!site && Sites && data?.SiteID > 0) {
      Sites.getSite(data.SiteID).then((site) => {
        setSite(site);
      }).catch((err) => showErrorAlert(err));
    }
  },[data,site,setSite,Sites,showErrorAlert]);

  const labelCols = 4;
  return <Container>
    {data && <div className={'small'}>
      <Row>
        <Col sm={labelCols}>
          User ID
        </Col>
        <Col>
          {data.UserID}
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Col sm={labelCols}>
          Site
        </Col>
        <Col>
          {data?.SiteID > 0 ? site?.SiteName : <>All Sites</>}
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Col sm={labelCols}>
          Phone
        </Col>
        <Col>
          {data.UserPhone}
        </Col>
      </Row>
      <Row className={'mt-2'}>
        <Col sm={labelCols}>
          Email
        </Col>
        <Col>
          {data.UserEmail}
        </Col>
      </Row>
      {Object.entries(ResourcePermissions).map((entry) =>
        <Row key={entry[0]}  className={'mt-2'}>
          <Col sm={labelCols}>
            {entry[0]} Permission
          </Col>
          <Col>
            {data[`${entry[0]}Permission`] || ''}
          </Col>
        </Row>
      )}
    </div>}
  </Container>;
}