import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import {useEffect} from "react";
import SelectField from "../forms/SelectField";
import {Col, Form, Row} from "react-bootstrap";
import {useFormData} from "../editor/FormEditor"

// number of milliseconds in one day
const ONE_DAY = 1000 * 60 * 60 * 24;

/**
 * @class LodgingData
 *
 * @property {Date} ArrivalDate
 * @property {Date} DepartureDate
 */

/**
 * @callback DataCallback
 * @param {name:String, value:String}
 */

/**
 * Arrival and departure date fields for guest book forms.
 *
 * @param lodgingData {LodgingData|GuestFeedbackData}
 * @param onChange {DataCallback}
 * @param labelCols {Number}
 * @returns {JSX.Element}
 * @constructor
 */
function LodgingFields({lodgingData, onChange, labelCols}) {
  const formData = useFormData();
  
  if (!labelCols) {
    labelCols = 2
  }
  // update departure date when arrival date changes
  useEffect(() => {
    if ((formData.edits.ArrivalDate && !formData.edits.DepartureDate) || (formData.edits.ArrivalDate && formData.edits.DepartureDate && formData.edits.DepartureDate <= formData.edits.ArrivalDate)) {
      const d = new Date(new Date(formData.edits.ArrivalDate).getTime() + ONE_DAY);
      onChange({
        name: "DepartureDate",
        value: d.toISOString()
      })
    }
  }, [formData.edits.ArrivalDate, formData.edits.DepartureDate, onChange]);

  // number of guests option data
  const options = [
    {name: "1", label: "1"},
    {name: "2", label: "2"},
    {name: "3", label: "3"},
    {name: "4", label: "4"},
  ]

  return (
    <>
      <Row className="mt-4">
        <Col sm={labelCols}>
          <Form.Label htmlFor="arrivaldate" column={true} className={"required"}>Arrival</Form.Label>
        </Col>
        <Col>
          <DatePicker
            selected={formData.edits.ArrivalDate}
            onChange={(date) => {
              onChange?.(
                {
                  value: date.toISOString(),
                  name: 'ArrivalDate'
                }
              );
            }}
            showMonthYearDropdown
            id="arrivaldate"
            className="form-control"
            style={{marginLeft: '10px'}}
            selectsStart={true}
            minDate={new Date() + ONE_DAY}
            startDate={formData.edits.ArrivalDate}
            endDate={formData.edits.DepartureDate}
            placeholderText={`Select a date.`}
            required={true}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Col sm={labelCols}>
          <Form.Label htmlFor="departuredate" column={true} className={"required"}>Departure</Form.Label>
        </Col>
        <Col>
          <DatePicker
            selected={formData.edits.DepartureDate}
            onChange={(date) => {
              onChange?.(
                {
                  value: date.toISOString(),
                  name: 'DepartureDate'
                }
              );
            }}
            showMonthYearDropdown
            id="departuredate"
            className="form-control"
            style={{marginLeft: '10px'}}
            selectsEnd={true}
            minDate={formData.edits.ArrivalDate + ONE_DAY}
            startDate={formData.edits.ArrivalDate}
            endDate={formData.edits.DepartureDate}
            placeholderText={`Select a date.`}
            required={true}
          />
        </Col>
      </Row>
      <Row className="mt-2">
        <Form.Label column={true} sm={labelCols} className="required" htmlFor="NumberOfGuests">Guests</Form.Label>
        <Col sm={2}>
          <SelectField
            name="NumberOfGuests"
            required={true}
            onChange={onChange}
            value={formData.edits.NumberOfGuests}
            options={options}
          />
        </Col>
      </Row>
    </>
  )
}

export default LodgingFields