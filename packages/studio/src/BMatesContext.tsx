// BmatesContext.tsx
import { Editor } from '@bmates/editor';

import React, { createContext, useContext, useState } from 'react';

export interface BmatesContextType {
  download: () => void;
  togglePlay: () => Promise<void>;
  toggleStopPlay: () => Promise<void>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  editorRef: React.RefObject<Editor>;
  toggleMuteTrack: (trackId: string) => void;
  removeTrack: (trackId: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const BmatesContext = createContext<BmatesContextType | undefined>(undefined);

export const BmatesProvider: React.FC<{ children: React.ReactNode; editorRef: React.RefObject<Editor> }> = ({
  children,
  editorRef,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async () => {
    if (editorRef.current) {
      await editorRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = async () => {
    if (editorRef.current) {
      await editorRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = async () => {
    if (editorRef.current) {
      await editorRef.current.stop();
      setIsPlaying(false);
    }
  };

  const download = () => {
    editorRef.current?.downloadBlob('bmates_audio.mp3');
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const toggleStopPlay = async () => {
    await stop();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    if (editorRef.current) {
      await editorRef.current.addWaveBuffer(file, audioBuffer);
    }
  };

  const toggleMuteTrack = (trackId: string) => {
    editorRef.current?.muteTrack(trackId);
  };

  const removeTrack = (trackId: string) => {
    editorRef.current?.removeTrack(trackId);
  };

  return (
    <BmatesContext.Provider
      value={{
        download,
        togglePlay,
        toggleStopPlay,
        toggleMuteTrack,
        removeTrack,
        isPlaying,
        setIsPlaying,
        handleFileUpload,
        editorRef,
      }}
    >
      {children}
    </BmatesContext.Provider>
  );
};

export const useBMates = () => {
  const context = useContext(BmatesContext);
  if (!context) {
    throw new Error('useBMates must be used within a BmatesProvider');
  }
  return context;
};
