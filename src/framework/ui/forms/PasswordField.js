import {Form} from "react-bootstrap";

/**
 * @typedef PasswordFieldProps
 *
 * @property {string} name               Field name, used to label the field and also for onChange events.
 * @property {string} label              Field label text.
 * @property {boolean} required          Is required?
 * @property {DataCallback} onChange     Standard data callback receiving {name, value} when field contents change
 */

/**
 *
 * @param {PasswordFieldProps} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function PasswordField(props) {
  return (
    <Form.Control
      {...props}
      type="password"
      autoComplete="current-password"
    />
  )
}
