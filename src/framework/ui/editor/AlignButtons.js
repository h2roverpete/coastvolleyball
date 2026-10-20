import {Button} from "react-bootstrap";
import {BsTextCenter, BsTextLeft, BsTextRight} from "react-icons/bs";
import {useEffect, useState} from "react";
import {useSiteContext} from "../content/Site";

/**
 * Display left/center/right alignment buttons.
 *
 * @param {boolean} editing             Are we editing? (controls visibility)
 * @param {function(string)} callback   Callback to receive changes.
 * @param {string} align                Initial alignment.
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function AlignButtons({editing, callback, align}) {

  const {siteData} = useSiteContext();

  const [alignment, setAlignment] = useState(null);
  useEffect(() => {
    if (alignment === null && align) {
      setAlignment(align);
    }
  }, [alignment, align]);
  return (
    <>
      {editing && (
        <div className={'AlignButtons btn-group btn-group-toggle'}>
          <Button
            onClick={() => {
              setAlignment('left');
              callback(AlignAction.ALIGN_LEFT);
            }}
            name={'align'}
            type="radio"
            variant={siteData?.SiteTheme}
            size={'sm'}
            checked={alignment === 'left'}
            className={`EditButton border border-secondary ${alignment === 'left' ? 'text-light bg-primary' : ''}`}
          ><BsTextLeft/></Button>
          <Button
            onClick={() => {
              setAlignment('center');
              callback(AlignAction.ALIGN_CENTER);
            }}
            type="radio"
            variant={siteData?.SiteTheme}
            size={'sm'}
            name={'align'}
            checked={alignment === 'center'}
            className={`EditButton border border-secondary ${alignment === 'center' ? 'text-light bg-primary' : ''}`}
          ><BsTextCenter/></Button>
          <Button
            onClick={() => {
              setAlignment('right');
              callback(AlignAction.ALIGN_RIGHT);
            }}
            type="radio"
            variant={siteData?.SiteTheme}
            size={'sm'}
            name={'align'}
            checked={alignment === 'right'}
            className={`EditButton border border-secondary  ${alignment === 'right' ? 'text-light bg-primary' : ''}`}
          ><BsTextRight/></Button>
        </div>
      )}
    </>
  );
}

/**
 * Actions for callback
 *
 * @enum {string}
 */
export const AlignAction = {
  ALIGN_LEFT: "alignLeft",
  ALIGN_RIGHT: "alignRight",
  ALIGN_CENTER: "alignCenter",
}