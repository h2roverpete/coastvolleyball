import EditorPanel from "../editor/EditorPanel";
import GuestBookFields from "./GuestBookFields";

export default function GuestBookConfigPanel(props) {
  return (<>
    <EditorPanel menuItems={props.menuItems}>
      <h5>Guest Book Properties</h5>
      <GuestBookFields {...props} />
    </EditorPanel>
  </>);
}