import { EditorDataType, EditorStyleType } from '@bmates/editor';

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
            src: '',
            user: '',
            start: 10,
            long: 35,
            group: 0,
            instrument: 'Piano',
          },
          {
            src: '',
            user: '',
            start: 50,
            long: 15,
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
            src: '',
            user: '',
            start: 40,
            long: 15,
            group: 1,
            instrument: 'Piano',
          },
          {
            src: '',
            user: '',
            start: 80,
            long: 15,
            group: 1,
            instrument: 'Guitar',
          },
        ],
      },
    ],
  },
];

const style: Partial<EditorStyleType> = {
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
    height: 45,
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
    </>
  );
};
export default App;
