import {
  DEFAULT_EDITOR_STYLE,
  Editor,
  EditorStyleType,
  ResolvedEditorStyleType,
  TrackDataType,
  clone,
  deepMerge,
} from '@bmates/editor';

import { useEffect, useMemo, useRef, useState } from 'react';

import { BMatesCanvas, BMatesClip, BMatesProject, BMatesRoot, BMatesTrack, BMatesTrackList } from './BMatesComposer';
import { useBMates } from './BMatesContext';

export interface TrackProps {
  track: TrackDataType;
  muted: boolean;
  toggleMute: () => void;
  removeTrack: () => void;
}

export interface BMatesProps {
  data: TrackDataType[];
  style?: EditorStyleType;
  trackEl?: (props: TrackProps) => JSX.Element;
  onError?: (error: Error) => void;
}

const defaultTrackEl = ({ track }: TrackProps) => <span>{track.name}</span>;

const BMatesComponent = ({ data, style = {}, trackEl = defaultTrackEl, onError }: BMatesProps) => {
  const { editorRef, toggleMuteTrack, removeTrack, setIsPlaying } = useBMates();
  const styleKey = JSON.stringify(style);
  const resolvedStyle = useMemo(
    () => deepMerge(clone(DEFAULT_EDITOR_STYLE), style) as ResolvedEditorStyleType,
    [styleKey],
  );
  const [sidebarWidth, setSidebarWidth] = useState(resolvedStyle.sidebar.width);
  const [_data, setData] = useState<TrackDataType[]>(data);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<HTMLCanvasElement | null>(null);

  const handleResize = () => {
    setSidebarWidth(
      window.innerWidth <= resolvedStyle.sidebar.mobileViewport
        ? resolvedStyle.sidebar.mobileWidth
        : resolvedStyle.sidebar.width,
    );
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    if (ref.current && !editorRef.current) {
      setError(null);
      editorRef.current = new Editor(ref.current, data, resolvedStyle);
      editorRef.current.on('data-change', evt => {
        setData(evt.data as TrackDataType[]);
      });
      editorRef.current.on('pause', evt => {
        setIsPlaying(evt.data);
      });
      void editorRef.current.ready.catch(reason => {
        const nextError = reason instanceof Error ? reason : new Error(String(reason));
        setError(nextError);
        onError?.(nextError);
      });
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [data, editorRef, onError, resolvedStyle, setIsPlaying, styleKey]);

  const errorMessage = error ? (
    <div role="alert" className="bmates-error">
      Audio could not be loaded: {error.message}
    </div>
  ) : null;

  return (
    <>
      {errorMessage}
      <div id="bmates" className="bmates" style={{ display: 'flex', height: '100%' }}>
        <div id="bmates-sidebar" className="bmates-sidebar" style={{ width: `${sidebarWidth}px`, flexShrink: 0 }}>
          <div
            className="bmates-sidebar-head"
            style={{ height: `${resolvedStyle.timeline.height + resolvedStyle.wave.margin / 2}px` }}
          ></div>
          <div className="bmates-sidebar-body">
            {_data.map(track => (
              <div
                key={`${track.id}`}
                className="bmates-track"
                style={{ height: `${resolvedStyle.wave.height + resolvedStyle.wave.margin}px` }}
              >
                {trackEl({
                  track,
                  muted: Boolean(track.mute),
                  toggleMute: () => toggleMuteTrack(track.id),
                  removeTrack: () => removeTrack(track.id),
                })}
              </div>
            ))}
          </div>
        </div>
        <canvas id="bmates-editor" className="bmates-editor" ref={ref} style={{ flexGrow: 1 }}></canvas>
      </div>
    </>
  );
};

export const BMates = Object.assign(BMatesComponent, {
  Canvas: BMatesCanvas,
  Clip: BMatesClip,
  Project: BMatesProject,
  Root: BMatesRoot,
  Track: BMatesTrack,
  TrackList: BMatesTrackList,
});
