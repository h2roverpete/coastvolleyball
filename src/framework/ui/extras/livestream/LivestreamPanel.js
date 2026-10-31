import {
  Col,
  Row,
  Form,
  Tooltip,
  OverlayTrigger,
  Button,
} from "react-bootstrap";
import {BsCopy} from "react-icons/bs";
import {useEffect, useState} from "react";
import IVSPlayer from "./IVSPlayer";
import EditorPanel from "../../editor/EditorPanel";
import FormEditor from "../../editor/FormEditor";
import {useRestApi} from "../../../api/RestApi";
import {useSiteContext} from "../../content/Site";
import {useAuth} from "../../../auth/AuthProvider";
import {Resource, Permission} from "../../../auth/Permissions";

export default function LivestreamPanel({data, livestreamId, menuItems}) {

  const {Livestreams} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();

  const [copyIngestUrlTooltip, setCopyIngestUrlTooltip] = useState('Copy URL to clipboard.');
  const [copyKeyTooltip, setCopyKeyTooltip] = useState('Copy key to clipboard.');
  const [livestreamData, setLivestreamData] = useState(data);
  const [canBroadcast, setCanBroadcast] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!livestreamData && livestreamId && Livestreams) {
      Livestreams.getLivestream(livestreamId).then(result => {
        setLivestreamData(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    }
  }, [data, livestreamData, livestreamId, Livestreams, showErrorAlert]);

  useEffect(() => {
    setCanBroadcast(hasPermission(Resource.LIVESTREAM, Permission.BROADCAST));
  }, [hasPermission]);

  useEffect(() => {
    setCanEdit(hasPermission(Resource.PAGE, Permission.ADMIN));
  }, [hasPermission]);

  function downloadConfigFile() {
    Livestreams.getConfigurationXml(livestreamData.LivestreamID).then((xml) => {
      const blob = new Blob([xml], {type: 'application/xml;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${livestreamData.IVSChannelName}-config.xml`); // File name to save as
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }).catch((error) => {
      showErrorAlert(error);
    })
  }

  return <>
    {livestreamData && <>
      <IVSPlayer data={livestreamData}/>
      {canBroadcast &&
        <FormEditor>
          <EditorPanel hideButtons={!canEdit} menuItems={menuItems}>
            <h5>{livestreamData.LivestreamName} Stream Settings</h5>
            <Row className={'mt-3'}>
              <Form.Label column={'sm'} htmlFor={'IVSIngestEndpoint'}>Secure Ingest URL</Form.Label>
              <Col xs={8} className={'d-flex justify-content-start align-items-center'}>
                <Form.Control
                  name={'IVSIngestEndpoint'}
                  value={`rtmps://${livestreamData.IVSIngestEndpoint}:443/app/`}
                  disabled={true}
                  size={'sm'}
                />
              </Col>
              <Col xs={1} className={'d-flex p-0 justify-content-start align-items-center'}>
                <OverlayTrigger
                  delay={{show: 500, hide: 0}}
                  overlay={<Tooltip>{copyIngestUrlTooltip}</Tooltip>}
                >
                  <BsCopy
                    style={{cursor: 'pointer'}}
                    onClick={() => navigator.clipboard.writeText(`rtmps://${livestreamData.IVSIngestEndpoint}:443/app/`).then(() => setCopyIngestUrlTooltip('Copied to clipboard.'))}
                  />
                </OverlayTrigger>
              </Col>
            </Row>
            <Row className={'mt-2'}>
              <Form.Label column={'sm'} htmlFor={'IVSStreamKey'}>Secure Stream Key</Form.Label>
              <Col xs={8} className={'d-flex justify-content-start align-items-center'}>
                <Form.Control
                  type={'password'}
                  name={'IVSStreamKey'}
                  value={livestreamData.IVSStreamKey}
                  disabled={true}
                  size={'sm'}
                />
              </Col>
              <Col xs={1} className={'d-flex p-0 justify-content-start align-items-center'}>
                <OverlayTrigger
                  delay={{show: 500, hide: 0}}
                  overlay={<Tooltip>{copyKeyTooltip}</Tooltip>}
                >
                  <BsCopy
                    style={{cursor: 'pointer'}}
                    onClick={() => navigator.clipboard.writeText(livestreamData.IVSStreamKey).then(() => setCopyKeyTooltip('Copied to clipboard.'))}
                  />
                </OverlayTrigger>
              </Col>
            </Row>
            <Row className={'mt-2'}>
              <Form.Label column={'sm'} htmlFor={'NonSecureIVSIngestEndpoint'}>Non-Secure Ingest URL</Form.Label>
              <Col xs={8} className={'d-flex justify-content-start align-items-center'}>
                <Form.Control
                  name={'NonSecureIVSIngestEndpoint'}
                  value={`rtmp://${livestreamData.IVSIngestEndpoint}/app/`}
                  disabled={true}
                  size={'sm'}
                />
              </Col>
              <Col xs={1} className={'d-flex p-0 justify-content-start align-items-center'}>
                <OverlayTrigger
                  delay={{show: 500, hide: 0}}
                  overlay={<Tooltip>{copyIngestUrlTooltip}</Tooltip>}
                >
                  <BsCopy
                    style={{cursor: 'pointer'}}
                    onClick={() => navigator.clipboard.writeText(`rtmp://${livestreamData.IVSIngestEndpoint}/app/`).then(() => setCopyIngestUrlTooltip('Copied to clipboard.'))}
                  />
                </OverlayTrigger>
              </Col>
            </Row>
            <Row className={'mt-2'}>
              <Col></Col>
              <Col xs={8}>
                <Button size={'sm'} onClick={downloadConfigFile}>
                  Download Blackmagic Configuration
                </Button>
              </Col>
              <Col xs={1}></Col>
            </Row>
          </EditorPanel>
        </FormEditor>
      }
    </>}
  </>;
}