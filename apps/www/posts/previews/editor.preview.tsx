import { BMates, BmatesProvider, Editor, EditorStyleType, TrackDataType, useBMates } from '@bmates/studio';

import { useRef, useState } from 'react';

import './editor.preview.css';

const demoProject: TrackDataType[] = [
  {
    id: 'drums',
    name: 'Drums',
    group: 0,
    songs: [
      { id: 'kick', src: '/bmates/audio/drum_0.mp3', user: '', start: 0, group: 0, instrument: 'Kick' },
      { id: 'snare', src: '/bmates/audio/drum_1.mp3', user: '', start: 9, group: 0, instrument: 'Snare' },
    ],
  },
  {
    id: 'melody',
    name: 'Melody',
    group: 1,
    songs: [
      { id: 'guitar', src: '/bmates/audio/guitar_0.mp3', user: '', start: 3, group: 1, instrument: 'Guitar' },
      { id: 'piano', src: '/bmates/audio/piano_0.mp3', user: '', start: 10, group: 1, instrument: 'Piano' },
    ],
  },
];

const demoStyle: EditorStyleType = {
  theme: { background: 'white', lineColor: '#e3e3e3', strokeLineColor: '#999999' },
  timeline: { gapHeight: 10, gapWidth: 10, timeDivde: 10, height: 45 },
  sidebar: { width: 180, mobileWidth: 72, mobileViewport: 640 },
  wave: { height: 95, borderRadius: 8, margin: 10, background: '#dad9db', fill: '#2e2c30' },
};

const Transport = () => {
  const { download, editorRef, handleFileUpload, isPlaying, togglePlay, toggleStopPlay } = useBMates();
  const [fileName, setFileName] = useState('Add audio');

  return (
    <div className="bm-demo-transport" aria-label="Editor transport">
      <button type="button" onClick={() => void togglePlay()}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={() => void toggleStopPlay()}>
        Stop
      </button>
      <label className="bm-demo-upload">
        <input
          type="file"
          accept="audio/*"
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) setFileName(file.name);
            void handleFileUpload(event);
          }}
        />
        {fileName}
      </label>
      <button type="button" onClick={() => void download()}>
        Download
      </button>
      <button type="button" onClick={() => console.info('BMates project', editorRef.current?.export())}>
        Export project
      </button>
    </div>
  );
};

export default function EditorPreview() {
  const editorRef = useRef<Editor | null>(null);

  return (
    <div className="bm-demo">
      <BmatesProvider editorRef={editorRef}>
        <Transport />
        <div className="bm-demo-workspace">
          <BMates
            data={demoProject}
            style={demoStyle}
            trackEl={({ muted, removeTrack, toggleMute, track }) => (
              <article className="bm-demo-track">
                <strong>{track.name}</strong>
                <div>
                  <button type="button" onClick={toggleMute}>
                    {muted ? 'Unmute' : 'Mute'}
                  </button>
                  <button type="button" onClick={removeTrack}>
                    Remove
                  </button>
                </div>
              </article>
            )}
          />
        </div>
      </BmatesProvider>
    </div>
  );
}
