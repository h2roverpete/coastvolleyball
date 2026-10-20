import {lazy, Suspense, useEffect, useRef, useState} from "react";
import {useTouchContext} from "../../../util/TouchProvider";

const MoveExtraMenu = lazy(() => import("../MoveExtraMenu"));
const InstagramExtraConfig = lazy(() => import("./InstagramExtraConfig"));
const FormEditor = lazy(() => import("../../editor/FormEditor"));
const InstagramEmbed = lazy(() => import("react-social-media-embed").then((module)=>({default: module.InstagramEmbed})));

/**
 * Embed an Instagram feed.
 *
 * @param extraData   {ExtraData}
 * @param sectionExtras   {[ExtraData]}
 * @param canEdit   {Boolean}
 * @returns {JSX.Element}
 * @constructor
 */
export default function InstagramExtra({extraData, sectionExtras, canEdit = false}) {

  const {supportsHover} = useTouchContext();

  const [data, setData] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setData(extraData);
  }, [extraData]);

  return (
    <div
      className={'Instagram mt-4'} style={{width: '100%', position: 'relative'}}
      onMouseOver={() => {
        if (supportsHover && canEdit) {
          buttonRef.current.hidden = false;
          if (menuRef.current) {
            menuRef.current.hidden = false;
          }
        }
      }}
      onMouseOut={() => {
        if (supportsHover && canEdit) {
          buttonRef.current.hidden = true;
          if (menuRef.current) {
            menuRef.current.hidden = true;
          }
        }
      }}
    >
      {data && (
        <Suspense>
          <InstagramEmbed
            url={`https://www.instagram.com/${data.InstagramHandle.replaceAll(/[^a-zA-Z0-9-\-_.]/g, '')}`}
            width={'100%'}/>
        </Suspense>
      )}
      {canEdit && (<Suspense>
        <FormEditor>
          <InstagramExtraConfig extraData={data} setExtraData={setData} buttonRef={buttonRef}/>
        </FormEditor>
        <MoveExtraMenu extraData={extraData} sectionExtras={sectionExtras} buttonRef={menuRef}/>
      </Suspense>)}
    </div>
  );
}