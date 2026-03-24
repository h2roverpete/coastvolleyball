import {useEffect, useRef} from "react";
import {useNavigate} from "react-router";
import PageConfig from "./PageConfig";
import FormEditor from "./FormEditor";
import {useTouchContext} from "../../util/TouchProvider";
import EditorPanel from "./EditorPanel";

/**
 * Edit page metadata fields.
 * @returns {JSX.Element}
 * @constructor
 */
export default function PageConfigPanel() {

  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const {supportsHover} = useTouchContext();

  const panelRef = useRef(null);

  function collapsePanel() {
    buttonRef.current?.click();
  }

  function onPageUpdated() {
    collapsePanel();
  }

  function onPageDeleted() {
    collapsePanel();
    navigate('/');
  }

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.hidden = supportsHover;
    }
  }, [supportsHover, buttonRef]);

  return (
    <div
      className="Editor PageConfigPanel"
      style={{
        position: 'fixed',
        top: -5,
        width: '100vw',
        zIndex: '1198',
      }}
      onMouseOver={() => {
        if (supportsHover) buttonRef.current.hidden = false;
      }}
      onMouseLeave={() => {
        if (supportsHover) buttonRef.current.hidden = true;
      }}
      ref={panelRef}
    >
      <FormEditor>
        <EditorPanel buttonRef={buttonRef} hideButtons={true}>
          <PageConfig
            onPageUpdated={onPageUpdated}
            onPageDeleted={onPageDeleted}
            modalRef={panelRef}
          />
        </EditorPanel>
      </FormEditor>
    </div>
  );
}