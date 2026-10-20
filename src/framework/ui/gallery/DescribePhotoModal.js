import DescribeContentModal from "../images/DescribeContentModal";
import FormEditor from "../editor/FormEditor";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";

/**
 * Modal dialog for setting Gallery photo description and keywords.
 *
 * @param show {boolean}
 * @param onHide {function(boolean)}
 * @param photoData {PhotoData}
 * @param onUpdate {function(PhotoData)}
 *
 * @returns {JSX.Element}
 * @constructor
 */
export default function DescribePhotoModal({show, onHide, photoData, onUpdate}) {

  const {Galleries} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  async function onDescribe() {
    // get item description from REST API
    return await Galleries.describePhoto(photoData.GalleryID, photoData.PhotoID);
  }

  function handleUpdate(data) {
    // update item
    const newData = {
      ...photoData,
      PhotoDescription: data.description,
      PhotoKeywords: data.keywords,
    }
    Galleries.updatePhoto(newData.GalleryID, newData.PhotoID, newData)
      .then(result => onUpdate(result))
      .catch(err => showErrorAlert(`Error updating photo.`, err));
  }

  return (
    <FormEditor>
      <DescribeContentModal
        show={show}
        onHide={onHide}
        title={'Photo Description & Keywords'}
        onDescribe={onDescribe}
        onUpdate={handleUpdate}
        data={photoData ? {
          id: photoData.PhotoID,
          description: photoData.PhotoDescription,
          keywords: photoData.PhotoKeywords,
        } : undefined}
      />
    </FormEditor>
  );
}