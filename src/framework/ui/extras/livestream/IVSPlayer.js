import React, {useEffect, useState} from 'react';
import {useRestApi} from "../../../api/RestApi";
import './IVSPlayer.css';

/**
 * Display a live stream player in the browser.
 *
 * @param {LivestreamData} data
 * @returns {Element}
 * @constructor
 */
export default function IVSPlayer({data}) {

  const {Livestreams} = useRestApi();

  const [streamInfo, setStreamInfo] = useState(null);

  useEffect(() => {
    const getStreamInfo = () => {
      if (data) {
        Livestreams.getStreamInfo(data.LivestreamID).then((stream) => {
          setStreamInfo(stream);
        }).catch((err) => {
          // stream not available
          setStreamInfo(null);
        })
      }
    }
    getStreamInfo();
    const intervalId = setInterval(getStreamInfo, 10000);
    return () => clearInterval(intervalId);
  }, [data, Livestreams, setStreamInfo]);

  return <>
    {data && <>
      <div className={'IVSPlayer'}>
        {streamInfo ?
          <div className={'IVSPlayerWrapper'}>
            <iframe
              src={data.IVSPlaybackURL}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className={'IVSPlayerIFrame'}
              title="Amazon IVS Live Stream Player Frame"
            />
          </div>
          :
          <div className={'IVSPlayerMessage'}>
            {data.LivestreamName} is not currently streaming. Please wait for the livestream to start.
          </div>
        }
      </div>
    </>}
  </>;
};