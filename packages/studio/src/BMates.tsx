import { Editor, TrackDataType, _EditorStyleType } from '@bmates/editor';

import { useEffect, useRef, useState } from 'react';

import { useBMates } from './BMatesContext';

interface TrackProps {
  track: TrackDataType;
  muted: boolean;
  toggleMute: () => void;
  removeTrack: () => void;
}

interface BMatesProps {
  data: TrackDataType[];
  style?: _EditorStyleType;
  trackEl?: (props: TrackProps) => JSX.Element;
}

export const BMates = ({ data, style, trackEl }: BMatesProps) => {
  const { editorRef, toggleMuteTrack, removeTrack, setIsPlaying } = useBMates();

  const [_data, setData] = useState<TrackDataType[]>(data);
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current && !editorRef.current) {
      // @ts-ignore
      editorRef.current = new Editor(ref.current, data, style);
      editorRef.current.on('data-change', () => {
        setData(editorRef.current?.export());
      });
      editorRef.current.on('pause', isPlaying => {
        // @ts-ignore
        setIsPlaying(isPlaying);
      });
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        // @ts-ignore
        editorRef.current = null;
      }
    };
  }, [editorRef, ref]);

  return (
    <div id="bmates" className="bmates" style={{ display: 'flex', height: '100%' }}>
      <div id="bmates-sidebar" className="bmates-sidebar" style={{ width: `${style.sidebar.width}px`, flexShrink: 0 }}>
        <div
          className="bmates-sidebar-head"
          style={{ height: `${style.timeline.height + style.wave.margin / 2}px` }}
        ></div>
        <div className="bmates-sidebar-body">
          {_data.map(track => (
            <div
              key={`${track.id}`}
              className="bmates-track"
              style={{ height: `${style.wave.height + style.wave.margin}px` }}
            >
              {trackEl({
                track,
                muted: false,
                toggleMute: () => toggleMuteTrack(track.id),
                removeTrack: () => removeTrack(track.id),
              })}
            </div>
          ))}
        </div>
      </div>
      <canvas id="bmates-editor" className="bmates-editor" ref={ref} style={{ flexGrow: 1 }}></canvas>
    </div>
  );
};
