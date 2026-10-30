import {
  Col,
  Row,
  Form,
  Tooltip,
  OverlayTrigger,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
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
import {usePageContext} from "../../content/Page";

export default function LivestreamPanel({data, livestreamId, extraData}) {

  const {Livestreams, Extras} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();
  const {removeExtraFromPage} = usePageContext();

  const [copyIngestUrlTooltip, setCopyIngestUrlTooltip] = useState('Copy URL to clipboard.');
  const [copyKeyTooltip, setCopyKeyTooltip] = useState('Copy key to clipboard.');
  const [livestreamData, setLivestreamData] = useState(data);
  const [canBroadcast, setCanBroadcast] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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

  function handleDelete() {
    if (extraData) {
      Extras.deleteExtra(extraData.ExtraID).then(() => {
        removeExtraFromPage(extraData.ExtraID);
      }).catch((error) => {
        showErrorAlert(error);
      });
    }
  }

  const extraButtons = <>
    <Button variant={'danger'} size={'sm'} onClick={() => setShowDeleteConfirmation(true)}>Remove from Page</Button>
  </>;

  return <>
    {livestreamData && <>
      <IVSPlayer data={livestreamData}/>
      {canBroadcast &&
        <FormEditor>
          <EditorPanel hideButtons={!canEdit} extraButtons={extraButtons}>
            <Row className={'mt-2'}>
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
              <Col xs={9}>
                <Button size={'sm'} onClick={downloadConfigFile}>
                  Download Blackmagic Configuration
                </Button>
              </Col>
            </Row>
          </EditorPanel>
        </FormEditor>
      }
      <Modal show={showDeleteConfirmation} onHide={()=>setShowDeleteConfirmation(false)} className={'Editor'}>
        <ModalBody>
          <h4>Remove Livestream</h4>
          Are you sure you want to remove the {livestreamData.LivestreamName} livestream from the page? The livestream itself will not be deleted.
        <div className={'d-flex justify-content-end align-items-center gap-3'}>
          <Button size={'sm'} variant="danger" onClick={handleDelete}>Remove</Button>
          <Button size={'sm'} variant="secondary" onClick={()=>setShowDeleteConfirmation(false)}>Cancel</Button>
        </div>
        </ModalBody>
      </Modal>
    </>}
  </>;
}