import EditorPanel from "../../editor/EditorPanel";
import {useRestApi} from "../../../api/RestApi";
import {usePageContext} from "../../content/Page";
import {useFormData} from "../../editor/FormEditor";
import {useEffect, useState} from "react";
import FileExtraFields from "./FileExtraFields";
import {useSiteContext} from "../../content/Site";
import {Button, Spinner} from "react-bootstrap";
import {BsStars} from "react-icons/bs";

export default function FileExtraConfig({extraData, buttonRef}) {

  const {Extras} = useRestApi();
  const {updateExtra, removeExtraFromPage} = usePageContext();
  const {showErrorAlert} = useSiteContext();

  /** @type FormDataAPI<ExtraData> */
  const formData = useFormData();

  const [describing, setDescribing] = useState(false);

  useEffect(() => {
    formData.setData(extraData);
  }, [extraData, formData]);

  function onUpdate() {
    console.debug(`Updating extra.`);
    Extras.insertOrUpdateExtra(formData.edits).then((extra) => {
      console.debug(`Extra updated.`);
      formData.update(extra);
    }).catch((err) => {
      showErrorAlert(`Error updating extra.`, err);
    });
    updateExtra(formData.edits);
  }

  function onDelete() {
    console.debug(`Deleting extra.`);
    Extras.deleteExtra(extraData.ExtraID).then(() => {
      console.debug(`Extra deleted.`);
    }).catch((err) => {
      showErrorAlert(`Error deleting extra.`, err);
    });
    removeExtraFromPage(extraData.ExtraID);
  }

  function onDescribe() {
    formData.onDataChanged({
      changes: [
        {name: 'ExtraDescription', value: ''},
        {name: 'ExtraKeywords', value: ''},
      ]
    });
    setDescribing(true);
    Extras.describeExtra(extraData.ExtraID)
      .then((summary) => {
        formData.onDataChanged({
          changes: [
            {name: 'ExtraDescription', value: summary.description},
            {name: 'ExtraKeywords', value: summary.keywords},
          ]
        });
        setDescribing(false);
      })
      .catch((err) => {
        showErrorAlert(`Error describing extra.`, err);
        setDescribing(false);
      });
  }

  const extraButtons = (
    <Button
      variant={'secondary'}
      size={'sm'}
      className={'me-2'}
      onClick={onDescribe}
      style={{minWidth: '80px'}}
    >
      {describing ? <Spinner size={'sm'}/> : <div><BsStars size={15} className={'me-1'}/> Describe</div>}
    </Button>
  );

  return (
    <EditorPanel
      onUpdate={onUpdate}
      onDelete={onDelete}
      isDataValid={() => true}
      buttonRef={buttonRef}
      extraButtons={extraButtons}
    >
      <h5>File Properties</h5>
      <FileExtraFields
        fetchingDescription={describing}
      />
    </EditorPanel>
  );
}