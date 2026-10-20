import {useRestApi} from "../../../api/RestApi";
import {usePageContext} from "../../content/Page";
import EditorPanel from "../../editor/EditorPanel";
import {useFormData} from "../../editor/FormEditor";
import {useEffect} from "react";
import InstagramExtraFields from "./InstagramExtraFields";
import {isValidInstagramHandle} from "../../../util/Validators";

export default function InstagramExtraConfig({extraData, setExtraData, buttonRef}) {

  const {Extras} = useRestApi();
  const {removeExtraFromPage} = usePageContext();

  /** @type FormDataAPI<ExtraData> */
  const formData = useFormData();

  useEffect(() => {
    formData.setData(extraData);
  }, [extraData, formData]);

  function onUpdate() {
    console.debug(`Updating instagram extra.`);
    Extras.insertOrUpdateExtra(formData.edits)
      .then((result) => {
        setExtraData(result);
      })
      .catch((err) => {
        console.error(`Error updating extra.`, err);
      })
  }

  function onDelete() {
    console.debug(`Delete extra....`);
    Extras.deleteExtra(extraData.ExtraID).then(() => {
      console.debug(`Extra deleted.`);
      removeExtraFromPage(extraData.ExtraID);
    }).catch((e) => console.error(`Error deleting extra.`, e));
  }

  return (
    <EditorPanel
      onDelete={onDelete}
      onUpdate={onUpdate}
      buttonRef={buttonRef}
      isDataValid={() => isValidInstagramHandle(formData.edits?.InstagramHandle)}
    >
      <h5>Instagram</h5>
      <InstagramExtraFields/>
    </EditorPanel>
  )
}