import { EditorDataType, EditorStyleType } from '@bmates/editor';

import { BMatesProvider, Button } from 'bmates-ui';
import { useState } from 'react';

import './App.css';
import BMates from './BMates';
import { DeepPartial } from './types/type';

const data: EditorDataType[] = [
  {
    name: 'bgm',
    tracks: [
      {
        id: 'TEMP0',
        category: 'Category 1',
        songs: [
          {
            id: 'BMATEST0',
            src: 'drum_0.mp3',
            user: '',
            start: 0,
            group: 0,
            instrument: 'Piano',
          },
          {
            id: 'BMATEST1',
            src: 'drum_1.mp3',
            user: '',
            start: 9,
            group: 0,
            instrument: 'Drum',
          },
        ],
      },
    ],
  },
  {
    name: 'effect',
    tracks: [
      {
        id: 'TEMP1',
        category: 'Category 2',
        songs: [
          {
            id: 'BMATEST3',
            src: 'guitar_0.mp3',
            user: '',
            start: 3,
            group: 1,
            instrument: 'Piano',
          },
          {
            id: 'BMATEST4',
            src: 'piano_0.mp3',
            user: '',
            start: 10.0,
            group: 1,
            instrument: 'Guitar',
          },
        ],
      },
    ],
  },
];

const style: DeepPartial<EditorStyleType> = {
  theme: {
    background: 'white',
    lineColor: '#e3e3e3',
    strokeLineColor: '#999999',
  },
  timeline: {
    gapHeight: 10,
    gapWidth: 10,
    timeDivde: 10,
    height: 45,
  },
  sidebar: {
    width: 300,
  },
  wave: {
    height: 95,
    borderRadius: 8,
    margin: 10,
  },
};

const ToggleMute = ({ muted, onClick }: { muted: boolean; onClick: () => void }) => {
  const [isMuted, setIsMuted] = useState<boolean>(muted);

  return (
    <Button
      onClick={() => {
        onClick();
        setIsMuted(!isMuted);
      }}
    >
      {isMuted ? 'Unmute' : 'Mute'}
    </Button>
  );
};

const App = () => {
  return (
    <BMatesProvider>
      <BMates
        data={data}
        style={style}
        trackEl={({ track, muted, toggleMute }) => {
          return (
            <div className="track">
              <div>{track.category}</div>
              <ToggleMute muted={muted} onClick={toggleMute} />
            </div>
          );
        }}
      />
      <button
        onClick={() => {
          console.log(data);
        }}
      >
        Click me
      </button>
    </BMatesProvider>
  );
};

export default App;
