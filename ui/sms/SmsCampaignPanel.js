import {Tab, Tabs} from "react-bootstrap";
import {useAuth} from "../../auth/AuthProvider";
import {Resource, Permission} from "../../auth/Permissions";
import {lazy, Suspense, useEffect, useState} from "react";
import {useRestApi} from "../../api/RestApi";
import {useSiteContext} from "../content/Site";
import {BsXLg} from "react-icons/bs";
import './SmsAdminPage.css'
import './SmsCampaignPanel.css';

const SmsSubscriberList = lazy(() => import("./SmsSubscriberList"));
const SmsMessageList = lazy(() => import("./SmsMessageList"));
const SmsMessagePanel = lazy(() => import("./SmsMessagePanel"));
const FormEditor = lazy(() => import("../editor/FormEditor"));
const SendSmsMessagePanel = lazy(() => import("./SendSmsMessagePanel"));
const SmsLogEntryList = lazy(() => import("./SmsLogEntryList"));
const SmsCampaignConfig = lazy(() => import("./SmsCampaignConfig"));

export default function SmsCampaignPanel({campaignId, campaignData}) {

  const [campaign, setCampaign] = useState(/** @type {SMSCampaignData} */ campaignData);
  const [message, setMessage] = useState(/** @type {SMSMessageData} */ null);
  const {SMS} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const {hasPermission} = useAuth();
  const hasSendPermission = hasPermission?.(Resource.SMS, Permission.SEND);
  const hasAdminPermission = hasPermission?.(Resource.SMS, Permission.ADMIN);

  useEffect(() => {
    if (campaignData && !campaign) {
      setCampaign(campaignData);
    } else if (campaignId && !campaign) {
      SMS.getSmsCampaign(campaignId).then((result) => {
        setCampaign(result);
      }).catch((err) => {
        showErrorAlert(err);
      })
    }
  }, [SMS, campaignId, campaign, campaignData, showErrorAlert]);

  function handleDeleteMessage(msg) {
    SMS.deleteSmsMessage(msg.SMSCampaignID, msg.SMSMessageID).then(() => {
      setMessage(null);
    }).catch((err) => {
      showErrorAlert(err)
      setMessage(null);
    });
  }

  return <>{campaign && hasSendPermission &&
    <div className={'Editor CampaignTabPanel'}>
      <Tabs
        defaultActiveKey={"send"}
        className="mt-2"
      >
        <Tab
          title={'Send'}
          eventKey={"send"}
          className="p-3 border border-top-0"
        >
          <div className={'TabPaneContents'}>
            <h4>Send to {campaign.CampaignName} Subscribers</h4>
            <div className={'ScrollY'}>
              <Suspense>
                <FormEditor>
                  <SendSmsMessagePanel campaign={campaign}/>
                </FormEditor>
              </Suspense>
            </div>
          </div>
        </Tab>
        <Tab
          title={'Messages'}
          eventKey={"messages"}
          className="p-3 border border-top-0"
        >
          <div className={'TabPaneContents'}>
            {message ? <>
                <BsXLg
                  role={'button'}
                  size={20}
                  onClick={() => setMessage(null)}
                  style={{position: "absolute", top: 0, right: 0}}
                />
                <h4>Message: {message.Title}</h4>
                <div className={'position-relative'}
                     style={{height: '100%', overflowY: 'auto', overflowX: 'clip'}}
                >
                  <Suspense>
                    <SmsMessagePanel
                      campaign={campaign}
                      message={message}
                      onDelete={handleDeleteMessage}
                    />
                  </Suspense>
                </div>
              </>
              : <>
                <h4>{campaign.CampaignName} Messages</h4>
                <Suspense>
                  <SmsMessageList
                    campaign={campaign}
                    onViewMessage={(message) => setMessage(message)}
                  />
                </Suspense>
              </>
            }
          </div>
        </Tab>
        {hasAdminPermission &&
          <Tab
            title={'Subscribers'}
            eventKey={"subscribers"}
            className="p-3 border border-top-0"
          >
            <div className={'TabPaneContents'}>
              <h4>{campaign.CampaignName} Subscribers</h4>
              <Suspense>
                <SmsSubscriberList
                  campaign={campaign}
                  showFilter={true}
                />
              </Suspense>
            </div>
          </Tab>
        }
        {hasAdminPermission &&
          <Tab
            title={'Log'}
            eventKey={"log"}
            className="p-3 border border-light-subtle border-top-0"
          >
            <div className={'TabPaneContents'}>
              <h4>{campaign.CampaignName} Log</h4>
              <Suspense>
                <FormEditor>
                  <SmsLogEntryList campaign={campaign}/>
                </FormEditor>
              </Suspense>
            </div>
          </Tab>
        }
        {hasAdminPermission &&
          <Tab
            title={'Config'}
            eventKey={"config"}
            className="p-3 border border-light-subtle border-top-0"
            style={{height: '100%', overflowY: 'auto', overflowX: 'clip'}}
          >
            <div className={'TabPaneContents'}>
              <h4>{campaign.CampaignName} Config</h4>
              <div className={'ScrollY'}>
                <Suspense>
                  <SmsCampaignConfig campaign={campaign}/>
                </Suspense>
              </div>
            </div>
          </Tab>
        }
      </Tabs>
    </div>
  }</>;
}