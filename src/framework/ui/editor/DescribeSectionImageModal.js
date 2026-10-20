import DescribeContentModal from "../images/DescribeContentModal";
import FormEditor from "../editor/FormEditor";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

/**
 * Modal dialog for setting Gallery photo description and keywords.
 *
 * @param show {boolean}
 * @param onHide {function(boolean)}
 * @param data {PageSectionData}
 * @param onUpdate {function(PhotoData)}
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function DescribeSectionImageModal({show, onHide, data, onUpdate}) {

  const {PageSections} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  async function onDescribe() {
    // get item description
    return await PageSections.describeSectionImage(data.PageID, data.PageSectionID);
  }

  function handleUpdate(summary) {
    // update item
    const {
      Extras,
      ...cleanData
    } = data;
    PageSections.insertOrUpdatePageSection({
      ...cleanData,
      SectionImageDescription: summary.description,
      SectionImageKeywords: summary.keywords,
    })
      .then(result => onUpdate({...result, Extras: data.Extras}))
      .catch(err => showErrorAlert(`Error updating image description.`, err));
  }

  return (
    <FormEditor>
      <DescribeContentModal
        show={show}
        onHide={onHide}
        title={'Photo Description & Keywords'}
        onDescribe={onDescribe}
        onUpdate={handleUpdate}
        data={data ? {
          id: data.PageSectionID,
          description: data.SectionImageDescription,
          keywords: data.SectionImageKeywords,
        } : undefined}
      />
    </FormEditor>
  );
}