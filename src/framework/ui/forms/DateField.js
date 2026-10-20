import DatePicker from "react-datepicker";

/**
 * Insert a date picker form control.
 *
 * @param name {String}                 Field Name for data callback.
 * @param id {String}                   ID for label binding.
 * @param value {String|undefined}      Date string in ISO format.
 * @param size {String|undefined}       Control size.
 * @param style {String|undefined}      Control style.
 * @param [endDate] {String|undefined}  Date string in ISO format.
 * @param [minDate] {Date}              Minimum date.
 * @param onChange {DataCallback}       Callback to receive date changes.
 * @returns {JSX.Element}
 * @constructor
 */
export default function DateField({name, id, size, style, value, endDate, onChange, minDate}) {

  const formData = useFormData();

  return (
    <DatePicker
      className={`form-control${size ? "-" + size : ''}`}
      selected={value}
      onChange={(date) => {
        onChange?.(
          {
            value: date.toISOString(),
            name: name
          }
        );
      }}
      showMonthYearDropdown
      id={id}
      size={size}
      style={style}
      minDate={minDate}
      startDate={value}
      endDate={endDate}
      placeholderText={`Select a date.`}
    />
  );

}