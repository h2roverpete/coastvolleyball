import EmailField from "../forms/EmailField";
import CustomFieldsConfig from "./CustomFieldsConfig";
import {Col, Row, Form} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";
import {useCallback, useEffect} from "react";
import {isValidEmail} from "../../util/Validators";

/**
 * @typedef GuestBookFieldsApi
 * @property {function()} isDataValid
 * @PROPERTY {function()} addCustomField
 */

/**
 * Display guest book configuration for editing.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param api {function(GuestBookFieldsApi)}
 * @returns {JSX.Element}
 * @constructor
 */
export default function GuestBookFields({guestBookConfig, api}) {

  const formData = useFormData();

  useEffect(() => {
    formData.setData(guestBookConfig);
  }, [guestBookConfig, formData]);

  const areCustomFieldsValid = useCallback(() => {
    for (let i = 0; i <= 8; i++) {
      if (formData.edits[`Custom${i}Type`]?.length > 0 && !formData.edits[`Custom${i}Label`]) {
        return false;
      }
    }
    return true;
  }, [formData]);

  const isDataValid = useCallback(() => {
    return formData.edits?.GuestBookName?.length > 0 && isValidEmail(formData.edits?.GuestBookEmail) && areCustomFieldsValid()
  }, [formData, areCustomFieldsValid]);

  const addCustomField = useCallback(() => {
    for (let i = 1; i <= 8; i++) {
      if (!formData.edits[`Custom${i}Type`]) {
        console.debug(`Adding custom field at position ${i}`);
        formData.update({
          ...formData.edits,
          [`Custom${i}Label`]: '',
          [`Custom${i}Type`]: 'text',
          [`Custom${i}Options`]: '',
          [`Custom${i}Required`]: false,
        });
        break;
      }
    }
  }, [formData]);

  const lastCustomField = useCallback(() => {
    let last = 0;
    for (let i = 1; i <= 8; i++) {
      if (formData.edits[`Custom${i}Type`]) {
        last = i;
      }
    }
    return last;
  }, [formData]);

  useEffect(() => {
    if (api) {
      api({
        isDataValid: isDataValid,
        addCustomField: addCustomField,
        lastCustomField: lastCustomField,
      })
    }
  }, [api, isDataValid, addCustomField, lastCustomField]);

  return <>
    <Row>
      <Col>
        <Form.Label
          size={"sm"}
          htmlFor={'GuestBookName'}
          column={'sm'}
          className="required"
        >
          Guest Book Name (Title for Emails)
        </Form.Label>
        <Form.Control
          size={"sm"}
          id={'GuestBookName'}
          value={formData.edits?.GuestBookName || ''}
          isInvalid={formData.isTouched('GuestBookName') && formData.edits?.GuestBookName?.length === 0}
          isValid={formData.isTouched('GuestBookName') && formData.edits?.GuestBookName?.length > 0}
          onChange={(e) => formData.onDataChanged({name: 'GuestBookName', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={6}>
        <Form.Label
          column={'sm'}
          htmlFor={'GuestBookEmail'}
          className="required"
        >
          Send Feedback Emails To
        </Form.Label>
        <EmailField
          id={'GuestBookEmail'}
          size={'sm'}
          value={formData.edits?.GuestBookEmail}
          required={true}
          onChange={(e) => formData.onDataChanged({name: 'GuestBookEmail', value: e.target.value})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          htmlFor={'GuestBookCCEmail'}
          column={'sm'}
        >
          CC Feedback Emails To
        </Form.Label>
        <EmailField
          size={'sm'}
          id={'GuestBookCCEmail'}
          value={formData.edits?.GuestBookCCEmail}
          onChange={(e) => formData.onDataChanged({name: 'GuestBookCCEmail', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Check
          checked={formData.edits?.AlwaysEmail || false}
          className={'form-control-sm'}
          label={'Always send email to admins, even without feedback'}
          onChange={(e) => formData.onDataChanged({name: 'AlwaysEmail', value: e.target.checked})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          size={"sm"}
          htmlFor={'GuestBookMessage'}
          column={'sm'}
        >
          Before Submit Message
        </Form.Label>
        <Form.Control
          as={"textarea"}
          size={"sm"}
          id={'GuestBookMessage'}
          value={formData.edits?.GuestBookMessage || ''}
          placeholder={'Please enter your information below.'}
          rows={3}
          onChange={(e) => formData.onDataChanged({name: 'GuestBookMessage', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col>
        <Form.Label
          size={"sm"}
          htmlFor={'DoneMessage'}
          column={'sm'}
        >
          After Submit Message
        </Form.Label>
        <Form.Control
          as={"textarea"}
          size={"sm"}
          id={'DoneMessage'}
          value={formData.edits?.DoneMessage || ''}
          rows={3}
          placeholder={'Your information has been submitted.'}
          onChange={(e) => formData.onDataChanged({name: 'DoneMessage', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row>
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={'SubmitButtonName'}
          column={'sm'}
        >
          Submit Button Label
        </Form.Label>
        <Form.Control
          size={"sm"}
          id={'SubmitButtonName'}
          value={formData.edits?.SubmitButtonName || ''}
          placeholder={'Submit'}
          onChange={(e) => formData.onDataChanged({name: 'SubmitButtonName', value: e.target.value})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={'AgainMessage'}
          column={'sm'}
        >
          Submit Again Button Label
        </Form.Label>
        <Form.Control
          size={"sm"}
          id={'AgainMessage'}
          value={formData.edits?.AgainMessage || ''}
          placeholder={'Submit Again'}
          onChange={(e) => formData.onDataChanged({name: 'AgainMessage', value: e.target.value})}
        />
      </Col>
    </Row>
    <Row className="mt-2">
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={'TextCaption'}
          column={'sm'}
        >
          Feedback Prompt
        </Form.Label>
        <Form.Control
          size={"sm"}
          id={'TextCaption'}
          value={formData.edits?.TextCaption || ''}
          placeholder={'Questions or Comments'}
          disabled={!formData.edits?.ShowFeedback}
          onChange={(e) => formData.onDataChanged({name: 'TextCaption', value: e.target.value})}
        />
      </Col>
      <Col sm={6}>
        <Form.Label
          size={"sm"}
          htmlFor={"LabelCols"}
          column={'sm'}
        >
          Label Width
        </Form.Label>
        <Form.Select
          id={'LabelCols'}
          value={formData.edits?.LabelCols || '2'}
          size={"sm"}
          onChange={(e) => formData.onDataChanged({name: 'LabelCols', value: parseInt(e.target.value)})}
        >
          <option value={'2'}>2 Columns</option>
          <option value={'3'}>3 Columns</option>
          <option value={'4'}>4 Columns</option>
          <option value={'5'}>5 Columns</option>
          <option value={'6'}>6 Columns</option>
        </Form.Select>
      </Col>
    </Row>
    <Row className="mt-2">
      <Form.Label column={'sm'} sm={2}>Show Inputs:</Form.Label>
      <Col sm={3}>
        <Form.Check
          checked={formData.edits?.ShowName || false}
          className={'form-control-sm'}
          label={'Name'}
          onChange={(e) => formData.onDataChanged({name: 'ShowName', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowDayPhone || false}
          className={'form-control-sm'}
          label={'Phone'}
          onChange={(e) => formData.onDataChanged({name: 'ShowDayPhone', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowEmail || false}
          className={'form-control-sm'}
          label={'Email'}
          onChange={(e) => formData.onDataChanged({name: 'ShowEmail', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowFeedback || false}
          className={'form-control-sm'}
          label={'Feedback'}
          onChange={(e) => formData.onDataChanged({name: 'ShowFeedback', value: e.target.checked})}
        />
      </Col>
      <Col sm={3}>
        <Form.Check
          checked={formData.edits?.ShowAddress || false}
          className={'form-control-sm'}
          label={'Address'}
          onChange={(e) => formData.onDataChanged({name: 'ShowAddress', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowContactInfo || false}
          className={'form-control-sm'}
          label={'Contact Method'}
          onChange={(e) => formData.onDataChanged({name: 'ShowContactInfo', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowMailingList || false}
          className={'form-control-sm'}
          label={'Mailing List'}
          onChange={(e) => formData.onDataChanged({name: 'ShowMailingList', value: e.target.checked})}
        />
      </Col>
      <Col>
        <Form.Check
          checked={formData.edits?.ShowEveningPhone || false}
          className={'form-control-sm'}
          label={'Mobile Phone'}
          onChange={(e) => formData.onDataChanged({name: 'ShowEveningPhone', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowFax || false}
          className={'form-control-sm'}
          label={'Alternate Phone'}
          onChange={(e) => formData.onDataChanged({name: 'ShowFax', value: e.target.checked})}
        />
        <Form.Check
          checked={formData.edits?.ShowLodgingFields || false}
          className={'form-control-sm'}
          label={'Lodging Fields'}
          onChange={(e) => formData.onDataChanged({name: 'ShowLodgingFields', value: e.target.checked})}
        />
      </Col>
    </Row>

    {formData.edits?.ShowMailingList && (
      <Row className="mt-2">
        <Col>
          <Form.Check
            checked={formData.edits?.MailingListDefault || false}
            className={'form-control-sm'}
            label={'Mailing list checked by default'}
            onChange={(e) => formData.onDataChanged({name: 'MailingListDefault', value: e.target.checked})}
          />
        </Col>
      </Row>
    )}
    <CustomFieldsConfig guestBookConfig={formData.edits} onChange={(data) => formData.onDataChanged(data)}/>
  </>
}