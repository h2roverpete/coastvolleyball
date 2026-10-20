import {Col, Form, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import React from 'react'

/**
 * Edit configuration of custom fields
 * @param guestBookConfig {GuestBookConfig}
 * @param onChange {DataChangedCallback}
 * @constructor
 */
export default function CustomFieldsConfig({guestBookConfig, onChange}) {

  const [config, setConfig] = useState([]);

  useEffect(() => {
    if (guestBookConfig) {
      const newConfig = [];
      for (let i = 1; i <= 8; i++) {
        if (guestBookConfig[`Custom${i}Type`]?.length) {
          newConfig[i] = (<React.Fragment key={i}>
              <CustomFieldConfig guestBookConfig={guestBookConfig} fieldNum={i} onChange={onChange}/>
            </React.Fragment>
          );
        }
      }
      setConfig(newConfig);
    } else {
      setConfig([]);
    }
  }, [guestBookConfig, onChange]);


  return (
    <>
      {config.map(item => (item))}
    </>
  );
}

/**
 * Config info for a specific custom field
 * @param guestBookConfig {GuestBookConfig}
 * @param fieldNum {Number}
 * @param onChange {DataChangedCallback}
 * @returns {JSX.Element}
 * @constructor
 */
function CustomFieldConfig({guestBookConfig, fieldNum, onChange}) {
  return (<>
    <Row className="mb-2">
      <Col sm={3}>
        <Form.Label htmlFor={`Custom${fieldNum}Label`} column={'sm'}>Label</Form.Label>
        <Form.Control
          size="sm"
          id={`Custom${fieldNum}Label`}
          required={true}
          value={guestBookConfig[`Custom${fieldNum}Label`] || ''}
          onChange={(e) => onChange({
            name: `Custom${fieldNum}Label`,
            value: e.target.value
          })}/>
      </Col>
      <Col sm={3}>
        <Form.Label htmlFor={`Custom${fieldNum}Type`} column={'sm'}>Type</Form.Label>
        <Form.Select
          size="sm"
          id={`Custom${fieldNum}Type`}
          value={guestBookConfig[`Custom${fieldNum}Type`] || ''}
          onChange={(e) => {
            onChange({
              name: `Custom${fieldNum}Type`,
              value: e.target.value
            });
          }}>
          <option value={''}>none (delete)</option>
          <option value={'text'}>text</option>
          <option value={'date'}>date</option>
          <option value={'popup'}>popup</option>
          <option value={'radio'}>radio buttons</option>
          <option value={'check'}>check boxes</option>
        </Form.Select>
      </Col>
      {guestBookConfig[`Custom${fieldNum}Type`] === 'popup' && (<>
        <Col sm={3}>
          <Form.Label htmlFor={`Custom${fieldNum}EmptyLabel`} column={'sm'}>Prompt</Form.Label>
          <Form.Control
            size="sm"
            id={`Custom${fieldNum}EmptyLabel`}
            placeholder={'(select)'}
            value={guestBookConfig[`Custom${fieldNum}EmptyLabel`] || ''}
            onChange={(e) => onChange({
              name: `Custom${fieldNum}EmptyLabel`,
              value: e.target.value
            })}/>
        </Col>
      </>)}
      {(guestBookConfig[`Custom${fieldNum}Type`] === 'popup'
          || guestBookConfig[`Custom${fieldNum}Type`] === 'check'
          || guestBookConfig[`Custom${fieldNum}Type`] === 'radio')
        && (<>
          <Col sm={9}>
            <Form.Label htmlFor={`Custom${fieldNum}Options`} column={'sm'}>Options</Form.Label>
            <Form.Control
              size="sm"
              id={`Custom${fieldNum}Options`}
              placeholder={'option 1, option 2'}
              value={guestBookConfig[`Custom${fieldNum}Options`] || ''}
              onChange={(e) => onChange({
                name: `Custom${fieldNum}Options`,
                value: e.target.value
              })}/>
          </Col>
        </>)}
      <Col sm={2} className="d-flex align-items-end">
        <Form.Check
          className="form-control-sm"
          id={`Custom${fieldNum}Required`}
          checked={guestBookConfig[`Custom${fieldNum}Required`] || false}
          label={'Required'}
          onChange={(e) => onChange({
            name: `Custom${fieldNum}Required`,
            value: e.target.checked
          })}/>
      </Col>
    </Row>
  </>);
}