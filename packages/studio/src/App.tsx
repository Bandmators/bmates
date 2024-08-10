import { Editor, EditorDataType } from '@bmates/editor';

import { useEffect, useRef } from 'react';

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

const App = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const editor = useRef<Editor | null>(null);

  useEffect(() => {
    if (ref.current && !editor.current) {
      editor.current = new Editor(ref.current, data);
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
      <canvas ref={ref}></canvas>
      <button onClick={() => editor.current?.play()}>Play</button>
      <button onClick={() => editor.current?.stop()}>Stop</button>
      <button onClick={() => editor.current?.pause()}>Pause</button>
    </>
  );
};
export default App;
