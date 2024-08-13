import { Editor, EditorDataType, EditorStyleType } from '@bmates/editor';

import { useEffect, useRef } from 'react';

import './App.css';

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
  sidebar: {
    width: 300,
  },
};

const App = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const editor = useRef<Editor | null>(null);

  useEffect(() => {
    if (ref.current && !editor.current) {
      editor.current = new Editor(ref.current, data, style);
    }
    return () => {
      if (editor.current) {
        editor.current.destroy();
        editor.current = null;
      }
    };
  }, [ref]);

  return (
    <>
      <div id="app" style={{ display: 'flex', height: '100vh' }}>
        <div id="sidebar" style={{ width: `300px`, flexShrink: 0 }}>
          {data.map(item =>
            item.tracks.map(track => (
              <div key={`${item.name}_${track.category}`}>
                {track.category}
                {track.songs.map(song => (
                  <div key={song.instrument}>{song.instrument}</div>
                ))}
              </div>
            )),
          )}
        </div>
        <canvas id="editor" ref={ref} style={{ flexGrow: 1 }}></canvas>
      </div>
      <button onClick={() => editor.current?.play()}>Play</button>
      <button onClick={() => editor.current?.stop()}>Stop</button>
      <button onClick={() => editor.current?.pause()}>Pause</button>
    </>
  );
};
export default App;
