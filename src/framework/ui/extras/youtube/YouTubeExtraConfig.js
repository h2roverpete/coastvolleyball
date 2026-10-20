import EditorPanel from "../../editor/EditorPanel";
import {useFormData} from "../../editor/FormEditor";
import {useEffect} from "react";
import {useRestApi} from "../../../api/RestApi";
import {useSiteContext} from "../../content/Site";
import {usePageContext} from "../../content/Page";
import YouTubeExtraFields from "./YouTubeExtraFields";
import {isValidYouTubeUrl} from "../../../util/Validators";

export default function YouTubeExtraConfig({buttonRef, data}) {

  const formData = useFormData();
  const {Extras} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {updateExtra, removeExtraFromPage} = usePageContext();

  useEffect(() => {
    formData.setData(data);
  }, [data, formData]);

  function onUpdate() {
    console.debug(`Updating YouTube extra.`);
    Extras.insertOrUpdateExtra(formData.edits)
      .then((result) => {
        formData.update(result);
        console.debug(`Extra updated.`);
      })
      .catch((err) => {
        showErrorAlert(err);
      });
    updateExtra(formData.edits);
  }

  function onDelete() {
    Extras.deleteExtra(data.ExtraID)
      .then(() => {
        console.debug(`Extra deleted.`);
      })
      .catch((err) => {
        showErrorAlert(err);
      });
    removeExtraFromPage(data.ExtraID);
  }

  function isDataValid() {
    return isValidYouTubeUrl(formData.edits.YouTubeVideoUrl);
  }

  return (
    <EditorPanel buttonRef={buttonRef} onUpdate={onUpdate} onDelete={onDelete} isDataValid={isDataValid}>
      <h5>YouTube</h5>
      <YouTubeExtraFields/>
    </EditorPanel>
  )
}