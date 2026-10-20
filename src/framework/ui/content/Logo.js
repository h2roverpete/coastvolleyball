import Image from 'react-bootstrap/Image';
import {useNavigate} from "react-router";

/**
 * Display a site logo.
 *
 * @property {string} src       Logo source file.
 * @property {string} href      Link to
 * @property {string} className Class name(s) to assign
 *
 * * @returns {JSX.Element}
 * @constructor
 */
export default function Logo({src, href, className}) {
  const navigate = useNavigate();
  return (
    <Image
      className={`Logo ${className}`}
      style={{cursor: 'pointer'}}
      src={src}
      onClick={() => navigate(href ? href : '/')}
    />
  )
}