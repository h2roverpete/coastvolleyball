import './TextMessagePreview.css'
import {BsX} from "react-icons/bs";

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @param {String[]} imageUrls
 * @param {function(String)} onDeleteImage
 * @constructor
 */
export default function TextMessagePreview({campaign, text, imageUrls, onDeleteImage}) {
  return <>{
    <div className={'bubble-bottom-right'}>
      <div className={'bubble-content'}>
        {imageUrls?.length > 0 &&
          <div className={'preview-image-row'}>{imageUrls.map((imageUrl) =>
            <div className={'preview-image-div'}>
              <img className={'preview-image'} key={imageUrl} src={imageUrl}  alt={''}/>
              {onDeleteImage && <BsX className={'preview-image-delete'} role={'button'} size={30}
                                     onClick={() => onDeleteImage(imageUrl)}/>}
            </div>)}
          </div>
        }
        {campaign && <>[{campaign.CampaignName}] </>}
        <span
          className={'text-light'}
          dangerouslySetInnerHTML={{__html: text?.replaceAll('\n', '<br/>')}}
        />
      </div>
    </div>
  }</>;
}