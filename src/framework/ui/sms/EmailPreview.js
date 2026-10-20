import './EmailPreview.css';
import {BsX} from "react-icons/bs";

/**
 * Display a <div> containing a message preview.
 *
 * @param {SMSCampaignData} campaign
 * @param {SMSMessageData} message
 * @param {SMSSubscriberData} subscriber
 * @param {EmailParams} [email]
 * @param {String[]} [imageUrls]
 * @param {function(String)} onDeleteImage
 * @constructor
 */
export default function EmailPreview({campaign, message, subscriber, email, imageUrls, onDeleteImage}) {
  if (email) {
    return <div className={'email-preview'}>
      <div>
        <strong>To: {email.to}</strong>
      </div>
      <div className={'mt-2'}><strong>From: {email.from}</strong>
      </div>
      <div className={'mt-2'}><strong>Subject: {email.subject}</strong></div>
      {email.html?.length > 0 ?
        <div className={'mt-2'} dangerouslySetInnerHTML={{__html: email.html}}></div>
        :
        <div className={'mt-2'}>{email.text}</div>
      }
    </div>;
  } else if (campaign && message) {
    return <div className={'email-preview'}>
      <div>
        <strong>To: {subscriber ? <>{subscriber.SubscriberName} &lt;{subscriber.SubscriberEmail}&gt;</> : <>Subscriber &lt;subscriber@whatever.com&gt;</>}</strong>
      </div>
      <div className={'mt-2'}><strong>From: {campaign.CampaignName} &lt;{campaign.CampaignEmail}&gt;</strong>
      </div>
      <div className={'mt-2'}><strong>Subject: [{campaign.CampaignName}] {message.Title}</strong></div>
      {imageUrls?.length > 0 &&
        <div className={'preview-image-row'}>{imageUrls.map((imageUrl) =>
          <div className={'preview-image-div'}>
            <img className={'preview-image'} key={imageUrl} src={imageUrl} alt={''}/>
            {onDeleteImage && <BsX className={'preview-image-delete'} role={'button'} size={30}
                                   onClick={() => onDeleteImage(imageUrl)}/>}
          </div>)}
        </div>
      }
      <div className={'mt-2'} dangerouslySetInnerHTML={{__html: message.Message?.replaceAll('\n', '<br/>')}}></div>
      <div className={'mt-2'}>You are receiving this email because you opted in to
        receive {campaign.CampaignName} notifications. <span
          className={'text-decoration-underline text-dark'}>Click here to unsubscribe.</span>
      </div>
    </div>;
  } else return <></>;
}