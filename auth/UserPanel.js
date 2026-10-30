import {Col, Row} from "react-bootstrap";

/**
 *
 * @param {NewUserData} data
 * @returns {JSX.Element}
 * @constructor
 */
export default function UserPanel({data}) {

  const labelCols=2;
  return <>
    {data && <div className={'small'}>
      <Row>
        <Col sm={labelCols}>
          Phone
        </Col>
        <Col>
          {data.UserPhone}
        </Col>
      </Row>
      <Row>
        <Col sm={labelCols}>
          Email
        </Col>
        <Col>
          {data.UserEmail}
        </Col>
      </Row>
    </div>}
  </>;
}