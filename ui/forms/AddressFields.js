import CountryField from "./CountryField";
import StateField from "./StateField";
import {Form, Row, Col} from "react-bootstrap";

/**
 * @class AddressData
 *
 * @property {String}Address1
 * @property {String}Address2
 * @property {String}City
 * @property {String}State
 * @property {String}Zip
 * @property {String}Country
 */

/**
 * Fields for address entry.
 * @param   address{GuestData|AddressData}
 * @param onChange{DataCallback} Callback to receive changes to Address data
 * @returns {JSX.Element}
 * @constructor
 */
function AddressFields({address, onChange}) {

  if (!address.Country) {
    // set US as default country
    address.Country = 'US';
  }

  return (
    <>
      <Row className="mt-2">
        <Col sm={8}>
          <Form.Label column={true} htmlFor={'Address1'}>Address</Form.Label>
          <Form.Control
            type="text"
            id="Address1"
            value={address?.Address1 || ''}
            onChange={e => {
              onChange?.({name: 'Address1', value: e.target.value});
            }}
            size="30"
            maxLength="50"
          />
          <Form.Control
            value={address?.Address2}
            className="mt-2"
            onChange={e => {
              onChange?.({name: 'Address2', value: e.target.value});
            }}
            size="30"
            maxLength="50"
          />
        </Col>
      </Row>

      <Row className="mt-2">
        <Col sm={8}>
          <Form.Label htmlFor="Country" column={true}>Country</Form.Label>
          <CountryField
            id="Country"
            name="Country"
            onChange={onChange}
            value={address?.Country.toUpperCase()}
          />
        </Col>
      </Row>

      <Row>
        <Col sm={4}>
          <Form.Label className="form-label" htmlFor="City" column={true}>City</Form.Label>
          <Form.Control
            id="City"
            value={address?.City}
            onChange={e => {
              onChange?.({name: 'City', value: e.target.value});
            }}
          />
        </Col>

        <Col sm={4}>
          <Form.Label className="form-label" htmlFor="State" column={true}>State</Form.Label>
          {address.Country === 'US' ? (
            <StateField
              id="State"
              name="State"
              onChange={(e) => onChange({name: 'State', value: e.target.value})}
              value={address?.State}
            />
          ) : (
            <Form.Control
              value={address?.State}
              onChange={e => {
                onChange?.({name: 'State', value: e.target.value});
              }}
            />
          )}
        </Col>

        <Col sm={3}>
          <Form.Label column={true} htmlFor="Zip">{address.Country === 'US' ? 'Zip' : 'Postcode'}</Form.Label>
          <Form.Control
            id="Zip"
            value={address?.Zip}
            onChange={e => {
              onChange?.({name: 'Zip', value: e.target.value});
            }}
            size="5"
            maxLength="10"/>
        </Col>
      </Row>
    </>
  )
}

export default AddressFields;