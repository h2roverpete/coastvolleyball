import {Form} from "react-bootstrap";
import {isValidEmail} from "../../util/Validators";
import {useFormData} from "../editor/FormEditor";

/**
 * Insert a form control that validates a user-entered email address.
 *
 * NOTE: Pass the value as NULL if you want the initial state of the control
 * to be unverified. Empty strings will be flagged as invalid input.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
export default function EmailField(props) {
  const formData = useFormData();

  return (
    <Form.Control
      {...props}
      type="email"
      autoComplete="email"
      value={props.value || ''}
      onChange={(e) => formData.onDataChanged({name: props.name, value: e.target.value})}
      isValid={formData?.isTouched(props.name) && isValidEmail(props.value)}
      isInvalid={formData?.isTouched(props.name) && !isValidEmail(props.value)}
      className={props.className}
    />
  )
}