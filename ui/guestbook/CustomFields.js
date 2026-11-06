import DatePicker from "react-datepicker";
import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor";

/**
 * Guest Book custom fields.
 *
 * @param guestBookConfig {GuestBookConfig}
 * @param feedbackData {GuestFeedbackData}
 * @param onChange {DataCallback}
 * @param labelCols {Number}
 * @returns {JSX.Element}
 * @constructor
 */
function CustomFields({guestBookConfig, feedbackData, labelCols}) {

  const formData = useFormData();

  if (!labelCols) {
    labelCols = 2;
  }
  const customFields = [];
  if (guestBookConfig) {
    for (let i = 1; i <= 8; i++) {
      if (guestBookConfig[`Custom${i}Type`]?.length > 0) {
        customFields.push((
          <Row className="mt-2" key={`${i}`}>
            <Col sm={labelCols}>
              <Form.Label
                htmlFor={`Custom${i}`}
                className={guestBookConfig[`Custom${i}Required`] === true ? 'required' : ''}
                column={true}
              >
                {guestBookConfig[`Custom${i}Label`]}
              </Form.Label>
            </Col>
            <Col sm={'auto'}>
              {((guestBookConfig[`Custom${i}Type`] === "text" && guestBookConfig[`Custom${i}Options`]?.length > 0) || guestBookConfig[`Custom${i}Type`] === "popup") && (
                <Form.Select
                  id={`Custom${i}`}
                  onChange={(e) => formData.onDataChanged({name: `Custom${i}`, value: e.target.value})}
                  value={feedbackData?.[`Custom${i}`] || ''}
                >
                  {guestBookConfig[`Custom${i}EmptyLabel`]?.length > 0 && (
                    <option value={''}>{guestBookConfig[`Custom${i}EmptyLabel`]}</option>
                  )}
                  {guestBookConfig[`Custom${i}Options`].split(',').map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </Form.Select>
              )}
              {(guestBookConfig[`Custom${i}Type`] === 'text' && !guestBookConfig[`Custom${i}Options`]) && (
                <Form.Control
                  name={`Custom${i}`}
                  onChange={(e) => formData.onDataChanged({name: `Custom${i}`, value: e.target.value})}
                  value={feedbackData?.[`Custom${i}`] || ''}
                />
              )}
              {guestBookConfig[`Custom${i}Type`] === 'date' && (
                <DatePicker
                  selected={feedbackData?.[`Custom${i}`]}
                  onChange={(date) => {
                    formData.onDataChanged({
                      name: `Custom${i}`,
                      value: date.toISOString()
                    })
                  }}
                  showMonthYearDropdown
                  id={`Custom${i}`}
                  name={`Custom${i}`}
                  className="form-control"
                  minDate={new Date()}
                  placeholderText={`(select a date)`}
                />
              )}
              {guestBookConfig[`Custom${i}Type`] === 'radio' && (<>
                {guestBookConfig[`Custom${i}Options`].split(',').map((option) => (
                  <Form.Check
                    type={'radio'}
                    name={`Custom${i}`}
                    label={option.trim()}
                    value={option.trim()}
                    checked={feedbackData?.[`Custom${i}`] === option.trim()}
                    onChange={() => {
                      formData.onDataChanged({name: `Custom${i}`, value: option.trim()})
                    }}
                    inline
                  />
                ))}
              </>)}
              {guestBookConfig[`Custom${i}Type`] === 'check' && guestBookConfig[`Custom${i}Options`]?.length > 0 && (<>
                {guestBookConfig[`Custom${i}Options`].split(',').map((option) => (
                  <Form.Check
                    name={`Custom${i}`}
                    label={option.trim()}
                    value={option.trim()}
                    checked={feedbackData?.[`Custom${i}`]?.split(',').includes(option.trim())}
                    onChange={(e) => {
                      const value = feedbackData?.[`Custom${i}`]?.length > 0 ? feedbackData[`Custom${i}`].split(',') : [];
                      if (e.target.checked && !value.includes(option.trim())) {
                        value.push(option.trim());
                      } else if (!e.target.checked && value.includes(option.trim())) {
                        value.splice(value.indexOf(option.trim()), 1);
                      }
                      formData.onDataChanged({name: `Custom${i}`, value: value.toString()})
                    }}
                    inline
                  />
                ))}
              </>)}
            </Col>
          </Row>
        ))
      }
    }
  }

  return (
    <>
      {customFields}
    </>
  )
}

export default CustomFields;