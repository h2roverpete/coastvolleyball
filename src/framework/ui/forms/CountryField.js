import {getData} from 'country-list'
import SelectField from "./SelectField";
import {useMemo} from "react";

/**
 * @typedef CountryFieldProps
 *
 * @property {string} name               Field name, used to label the field and also for onChange events.
 * @property {string} value              Field current value.
 * @property {string} className          One or more additional class names for field.
 * @property {boolean} required          Is required?
 * @property {string} prompt             Prompt string when nothing is selected.
 * @property {DataCallback} onChange     Standard data callback receiving {name, value} when field contents change
 */

/**
 * Form field with list of countries.
 *
 * @param props {CountryFieldProps}
 * @constructor
 */
function CountryField(props) {

  const options = useMemo(() => {
    const options = [];
    for (const data of getData()) {
      options.push({
        value: data.code,
        label: data.name.replace(/\([^)]+\)/g, ''),
      })
    }
    return options;
  },[]);

  return (
    <SelectField
      {...props}
      options={options}
    />
  )
}

export default CountryField;
