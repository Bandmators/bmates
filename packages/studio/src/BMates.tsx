import { Editor, EditorDataType, EditorStyleType, TrackDataType } from '@bmates/editor';

import { useEffect, useRef } from 'react';

interface BMatesProps {
  data: EditorDataType[];
  style?: Partial<EditorStyleType>;
  trackEl?: ({ track, muted }: { track: TrackDataType; muted: boolean }) => JSX.Element;
}

const BMates = ({ data, style, trackEl }: BMatesProps) => {
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
      <div id="bmates" className="bmates" style={{ display: 'flex', height: '100vh' }}>
        <div
          id="bmates-sidebar"
          className="bmates-sidebar"
          style={{ width: `${style.sidebar.width}px`, flexShrink: 0 }}
        >
          <div className="bmates-sidebar-head" style={{ height: `${style.timeline.height}px` }}></div>
          <div className="bmates-sidebar-body">
            {data.map(item =>
              item.tracks.map(track => (
                <div
                  key={`${item.name}_${track.category}`}
                  className="bmates-track"
                  style={{ height: `${style.wave.height + style.wave.margin * 2}px` }}
                >
                  {trackEl({ track, muted: false })}
                  {/* {track.songs.map(song => (
                  <div key={song.instrument}>{song.instrument}</div>
                ))} */}
                </div>
              )),
            )}
          </div>
        </div>
        <canvas id="bmates-editor" className="bmates-editor" ref={ref} style={{ flexGrow: 1 }}></canvas>
      </div>
      <button onClick={() => editor.current?.play()}>Play</button>
      <button onClick={() => editor.current?.stop()}>Stop</button>
      <button onClick={() => editor.current?.pause()}>Pause</button>
    </>
  );
};
export default BMates;
