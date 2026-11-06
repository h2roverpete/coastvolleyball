import AddressFields from "../forms/AddressFields";
import PhoneNumberField from "../forms/PhoneNumberField";
import EmailField from "../forms/EmailField";
import {Col, Row, Form} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";

/**
 * Display guest fields from the guest book database.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param labelCols {Number}
 * @constructor
 */
function GuestFields({guestBookConfig, labelCols}) {
  if (!labelCols) {
    labelCols = 2;
  }
  const formData = useFormData();

  return (
    <>
      {guestBookConfig?.ShowName && (<>
        <Row>
          <Col sm={6}>
            <Form.Label htmlFor="FirstName" className={'required text-nowrap'} column={true} sm={labelCols}>First
              Name</Form.Label>
            <Form.Control
              isValid={formData.edits.FirstName != null && formData.edits.FirstName?.length > 0}
              isInvalid={formData.edits.FirstName?.length === 0}
              id="FirstName"
              size="20"
              value={formData.edits.FirstName || ''}
              onChange={e => formData.onDataChanged({
                name: 'FirstName',
                value: e.target.value
              })}
            />
          </Col>
          <Col sm={6}>
            <Form.Label htmlFor="LastName" className={'required text-nowrap'} sm={labelCols} column={true}>Last
              Name</Form.Label>
            <Form.Control
              isValid={formData.edits.LastName != null && formData.edits.LastName?.length > 0}
              isInvalid={formData.edits.LastName?.length === 0}
              id="LastName"
              size="20"
              value={formData.edits.LastName || ''}
              onChange={e => formData.onDataChanged({
                name: 'LastName',
                value: e.target.value
              })}
            />
          </Col>
        </Row>
      </>)}
      {guestBookConfig?.ShowAddress && (
        <AddressFields address={formData.edits} onChange={(data) => formData.onDataChanged(data)}/>
      )}
      {guestBookConfig?.ShowDayPhone && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="DayPhone" column={true} sm={labelCols}>Phone</Form.Label>
            <PhoneNumberField
              name="DayPhone"
              id="DayPhone"
              value={formData.edits.DayPhone || ''}
              onChange={(data)=>formData.onDataChanged(data)}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowEveningPhone && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="EveningPhone" column={true} sm={labelCols}>Mobile Phone</Form.Label>
            <PhoneNumberField
              name="EveningPhone"
              id="EveningPhone"
              value={formData.edits.EveningPhone || ''}
              onChange={(data)=>formData.onDataChanged(data)}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowFax && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label htmlFor="Fax" column={true} sm={labelCols}>Alternate</Form.Label>
            <PhoneNumberField
              name="Fax"
              id="Fax"
              value={formData.edits.Fax || ''}
              onChange={(data)=>formData.onDataChanged(data)}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowEmail && (
        <Row className={"mt-2"}>
          <Col sm={6}>
            <Form.Label className="required" column={true}>Email</Form.Label>
            <EmailField
              name="Email"
              id="Email"
              size="30"
              value={formData.edits.Email}
              maxLength="50"
              required={true}
            />
          </Col>
        </Row>
      )}
      {guestBookConfig?.ShowContactInfo && (<>
        <Row className={"mt-4"}>
          <Form.Label htmlFor="ContactMethod" column={true} sm={'auto'}>Contact By</Form.Label>
          <Col sm={3}>
            <Form.Select
              id="ContactMethod"
              value={formData.edits?.ContactMethod || ''}
              onChange={(e) => formData.onDataChanged({name: 'ContactMethod', value: e.target.value})}
            >
              {guestBookConfig?.ShowEmail && (<option>Email</option>)}
              {guestBookConfig?.ShowDayPhone && (<option>Phone</option>)}
              {guestBookConfig?.ShowEveningPhone && (<option>Mobile</option>)}
              {guestBookConfig?.ShowFax && (<option>Alternate</option>)}
            </Form.Select>
          </Col>
        </Row>
      </>)}
      {guestBookConfig?.ShowMailingList && (
        <Row className={"mt-2"}>
          <Col>
            <Form.Check
              name="MailingList"
              id="mailinglist"
              value="1"
              label={"Add me to the mailing list"}
              checked={formData.edits.MailingList ? formData.edits.MailingList : guestBookConfig.MailingListDefault}
              onChange={e => formData.onDataChanged({name: 'MailingList', value: e.target.checked})}
            />
          </Col>
        </Row>
      )}
    </>
  )
}

export default GuestFields;