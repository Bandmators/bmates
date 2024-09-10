import { EditorDataType, EditorStyleType } from '@bmates/editor';

import { DeepPartial } from '@/types/type';

import './App.css';
import BMates from './BMates';

const data: EditorDataType[] = [
  {
    name: 'bgm',
    tracks: [
      {
        category: 'Category 1',
        songs: [
          {
            src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/drum_0.mp3',
            user: '',
            start: 0,
            long: 5.61,
            group: 0,
            instrument: 'Piano',
          },
          {
            src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/drum_1.mp3',
            user: '',
            start: 9,
            long: 7.41,
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
        category: 'Category 2',
        songs: [
          {
            src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/guitar_0.mp3',
            user: '',
            start: 3,
            long: 6.67,
            group: 1,
            instrument: 'Piano',
          },
          {
            src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/piano_0.mp3',
            user: '',
            start: 10.0,
            long: 5.67,
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
const App = () => {
  return (
    <>
      <BMates
        data={data}
        style={style}
        trackEl={({ track, muted }) => {
          return (
            <div className="track">
              <div>{track.category}</div>
              <button>{muted ? 'Unmute' : 'Mute'}</button>
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
    </>
  );
};

export default App;
