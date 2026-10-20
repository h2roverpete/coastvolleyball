import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './PhoneNumberField.css'
import {useFormData} from "../editor/FormEditor";

/**
 * Form field for phone number input
 *
 * @param name{String}
 * @param id{String}
 * @param value{String}
 * @constructor
 */
function PhoneNumberField({name, id, value}) {
  const formData = useFormData();
  return (
    <PhoneInput
      inputProps={{
        name: name,
        id: id,
        required: true,
      }}
      value={value}
      country={'us'}
      onChange={(value, country, e, formattedValue) => {
        formData.onDataChanged({
          name: name,
          value: formattedValue,
        })
      }}
      dropdownClass={'dropdown'}
      inputClass={'phone'}
      inputStyle={{backgroundColor: 'var(--bs-body-bg)', width: '100%'}}
      buttonStyle={{backgroundColor: 'var(--bs-body-bg)'}}
      dropdownStyle={{backgroundColor: 'var(--bs-body-bg)'}}
    />
  )
}

export default PhoneNumberField;