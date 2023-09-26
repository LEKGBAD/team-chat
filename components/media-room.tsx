"use client";

import '@livekit/components-styles';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { Channel } from '@prisma/client';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

interface MediaRoomProps {
    chatId:string;
    video:boolean;
    audio:boolean
}

export default function MediaRoom(
    {
        chatId,
        audio,
        video

    }:MediaRoomProps
) {
    const {user}=useUser();
  // TODO: get user input for room and name
  const [token, setToken] = useState("");

  useEffect(() => {
    if(!user?.firstName || !user.lastName) return

    const name=`${user.firstName} ${user.lastName}`;

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [user?.firstName,user?.lastName,chatId]);

  if (token === "") {
    return <div className='flex flex-col flex-1 justify-center items-center'>
        <Loader2 className='h-7 w-7 text-zinc-500 animate-spin my-4'/>
        <p className='text-xs text-zinc-500 dark:text-zinc-400'>
            Loading...
        </p>
        </div>;
  }

  return (
    <LiveKitRoom
      video={video}
      audio={audio}
      token={token}
      connect={true}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      {/* Your custom component with basic video conferencing functionality. */}
      <VideoConference />
      {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
      {/* <RoomAudioRenderer /> */}
      {/* Controls for the user to start/stop audio, video, and screen 
      share tracks and to leave the room. */}
      {/* <ControlBar /> */}
    </LiveKitRoom>
  );
}

