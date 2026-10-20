import stateList from 'states-us';
import Form from 'react-bootstrap/Form';
import {useFormData} from "../editor/FormEditor";

/**
 * @typedef StateFieldProps
 *
 * @property {string} name               Field name, used to label the field and also for onChange events.
 * @property {string} value              Field current value.
 * @property {string} className          One or more additional class names for field.
 * @property {boolean} required          Is required?
 * @property {string} prompt             Prompt string when nothing is selected.
 */

/**
 * Form field with list of states.
 *
 * @param props {StateFieldProps}
 * @constructor
 */
function StateField(props) {
  const formData = useFormData();
  return (
    <Form.Select
      {...props}
      onChange={e => formData.onDataChanged({name: props.name, value: e.target.value})}
    >
      <option key={'-'}>(Select)</option>
      {stateList.map(elem => (
        <option id={elem.abbreviation} value={elem.abbreviation} key={elem.abbreviation}>{elem.name}</option>
      ))}
    </Form.Select>
  )
}

export default StateField;
