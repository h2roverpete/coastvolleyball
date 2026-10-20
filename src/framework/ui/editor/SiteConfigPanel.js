import {Button, Collapse} from "react-bootstrap";
import {BsChevronCompactLeft, BsChevronCompactRight, BsXLg} from "react-icons/bs";
import SiteOutline from "./SiteOutline";
import FormEditor from "./FormEditor";
import {useRef, useState} from "react";
import SiteConfig from "./SiteConfig";
import {useTouchContext} from "../../util/TouchProvider";
import EditorPanel, {Direction} from "./EditorPanel";

export default function SiteConfigPanel() {

  const [expanded, setExpanded] = useState(false);
  const buttonRef = useRef(null);
  const {supportsHover} = useTouchContext();

  return (<div
    className={'Editor SiteConfigPanel'}
    style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
    }}
    onMouseOver={() => {
      if (supportsHover) buttonRef.current.hidden = false;
    }}
    onMouseLeave={() => {
      if (supportsHover) buttonRef.current.hidden = true;
    }}
  >
    <div
      className={`Editor EditorPanel Header ${expanded ? 'expanded' : 'collapsed'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: '-5px',
        zIndex: 1198,
        height: '100dvh',
        width: '25px',
      }}
    >
      <Button
        variant=""
        onClick={() => setExpanded(!expanded)}
        className={`Editor EditorToggle vertical ${expanded ? 'expanded' : 'collapsed'}`}
        style={{
          padding: '30px 5px 0 0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        hidden={supportsHover}
        ref={buttonRef}
      >
        {expanded ? (<BsChevronCompactLeft size={'25'}/>) : ((<BsChevronCompactRight size={'25'}/>))}
      </Button>
    </div>
    <Collapse
      in={expanded}
      dimension={'width'}
    >
      <div
        className={`Editor EditorPanel Body ${expanded ? 'expanded' : 'collapsed'}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1197,
          height: '100dvh'
        }}
      >
        <div style={{
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
        }}>
          <BsXLg
            style={{
              position: 'absolute',
              top: '25px',
              right: '10px',
              fontSize: '14pt',
              cursor: 'pointer',
            }}
            onClick={() => {
              setExpanded(false)
            }}
          />
          <div
            className={`Editor OutlinePanel`}
            style={{
            flexGrow: 1,
            flexShrink: 1,
            overflow: 'hidden',
          }}>
            <SiteOutline/>
          </div>
          <div
            style={{
            flexGrow: 0,
            flexShrink: 0,
          }}>
            <FormEditor>
              <EditorPanel hideButtons={true} hideCloseBox={true} direction={Direction.UP}>
                <SiteConfig/>
              </EditorPanel>
            </FormEditor>
          </div>
        </div>
      </div>
    </Collapse>
  </div>);
}