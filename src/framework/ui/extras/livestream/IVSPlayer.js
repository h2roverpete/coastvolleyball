import React, {useEffect, useState} from 'react';
import {useRestApi} from "../../../api/RestApi";
import {useSiteContext} from "../../content/Site";

/**
 * Display a live stream player in the browser.
 *
 * @param {LivestreamData} data
 * @returns {Element}
 * @constructor
 */
export default function IVSPlayer({data}) {

  const {Livestreams} = useRestApi();
  const {showErrorAlert} = useSiteContext();

  const [streamInfo, setStreamInfo] = useState(null);

  useEffect(() => {
    if (data && !streamInfo) {
      Livestreams.getStreamInfo(data.LivestreamID).then((stream) => {
        setStreamInfo(stream);
      }).catch((err) => {
        // stream not available
      })
    }
  }, [data, Livestreams, setStreamInfo]);

  return <>
    {data && <>
      <div style={{width: '100%', maxWidth: '800px', margin: '0 auto'}}>
        {streamInfo ?
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            backgroundColor: '#000',
            overflow: 'hidden',
            borderRadius: '4px'
          }}>
            <iframe
              src={data.IVSPlaybackURL}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Amazon IVS Live Stream Player Frame"
            />
          </div>
          :
          <div className={'w-100 h-100 d-flex align-items-center justify-content-center text-center p-5'}
               style={{backgroundColor: '#00000044', aspectRatio: '16/9'}}>
            {data.LivestreamName} is currently not streaming.<br/>Please wait for the livestream to start.
          </div>
        }
      </div>
    </>}
  </>;
};