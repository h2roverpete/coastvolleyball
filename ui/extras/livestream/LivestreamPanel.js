import {Col, Row, Form, Tooltip, OverlayTrigger} from "react-bootstrap";
import {BsCopy} from "react-icons/bs";
import {useEffect, useState} from "react";
import IVSPlayer from "./IVSPlayer";
import EditorPanel from "../../editor/EditorPanel";
import FormEditor from "../../editor/FormEditor";
import {useRestApi} from "../../../api/RestApi";
import {useSiteContext} from "../../content/Site";
import {useAuth} from "../../../auth/AuthProvider";
import {Resource, Permission} from "../../../auth/Permissions";

export default function LivestreamPanel({data, livestreamId}) {

  const {Livestreams} = useRestApi();
  const {showErrorAlert} = useSiteContext();
  const {hasPermission} = useAuth();

  const [copyPlaybackUrlTooltip, setCopyPlaybackUrlTooltip] = useState('Copy URL to clipboard.');
  const [copyIngestUrlTooltip, setCopyIngestUrlTooltip] = useState('Copy URL to clipboard.');
  const [copyKeyTooltip, setCopyKeyTooltip] = useState('Copy key to clipboard.');
  const [livestreamData, setLivestreamData] = useState(data);
  const [canBroadcast, setCanBroadcast] = useState(false);

  useEffect(() => {
    if (!livestreamData && livestreamId && Livestreams) {
      Livestreams.getLivestream(livestreamId).then(result => {
        setLivestreamData(result);
      }).catch(error => {
        showErrorAlert(error);
      })
    }
  }, [data, livestreamData, livestreamId]);

  useEffect(() => {
    setCanBroadcast(hasPermission(Resource.LIVESTREAM, Permission.BROADCAST));
  }, [hasPermission]);
  return <>
    {livestreamData && <>
      <IVSPlayer data={livestreamData}/>
      {canBroadcast &&
        <FormEditor>
          <EditorPanel hideButtons>
            <Row className="mt-4">
              <Form.Label column={'sm'} htmlFor={'IVSPlaybackURL'}>Playback URL</Form.Label>
              <Col xs={8} className={'d-flex justify-content-start align-items-center'}>
                <Form.Control
                  name={'IVSPlaybackURL'}
                  value={livestreamData.IVSPlaybackURL}
                  disabled={true}
                  size={'sm'}
                />
              </Col>
              <Col xs={1} className={'d-flex p-0 justify-content-start align-items-center'}>
                <OverlayTrigger
                  delay={{show: 500, hide: 0}}
                  overlay={<Tooltip>{copyPlaybackUrlTooltip}</Tooltip>}
                >
                  <BsCopy
                    style={{cursor: 'pointer'}}
                    onClick={() => navigator.clipboard.writeText(livestreamData.IVSPlaybackURL).then(() => setCopyPlaybackUrlTooltip('Copied to clipboard.'))}
                  />
                </OverlayTrigger>
              </Col>
            </Row>
            <Row className={'mt-2'}>
              <Form.Label column={'sm'} htmlFor={'IVSIngestEndpoint'}>Ingest URL</Form.Label>
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
              <Form.Label column={'sm'} htmlFor={'IVSStreamKey'}>Stream Key</Form.Label>
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
          </EditorPanel>
        </FormEditor>
      }
    </>}
  </>;
}