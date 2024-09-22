import { Editor, EditorDataType, EditorStyleType, SongDataType, TrackDataType } from '@bmates/editor';

import { useCallback, useEffect, useRef, useState } from 'react';

import { DeepPartial } from '@/types/type';

interface BMatesProps {
  data: EditorDataType[];
  style?: DeepPartial<EditorStyleType>;
  trackEl?: ({ track, muted }: { track: TrackDataType; muted: boolean }) => JSX.Element;
}

const BMates = ({ data, style, trackEl }: BMatesProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const editor = useRef<Editor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      editor.current?.pause();
    } else {
      await editor.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleStopPlay = useCallback(async () => {
    editor.current?.stop();
    setIsPlaying(false);
  }, [isPlaying]);

  // const toggleMute = useCallback(
  //   (trackId: string) => {
  //     if (isReady) {
  //       player.mute(trackId, !player.isMuted(trackId));
  //     }
  //   },
  //   [player, isReady],
  // );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const newSong: SongDataType = {
      src: URL.createObjectURL(file),
      user: 'BMates',
      start: 0,
      long: audioBuffer.duration,
      group: editor.current.data.length,
      instrument: file.name,
      source: {
        buffer: audioBuffer,
      },
    };
    const newTrack: TrackDataType = {
      category: 'New Track',
      songs: [newSong],
    };
    const newEditorData: EditorDataType = {
      name: 'New Track',
      tracks: [newTrack],
    };

    data.push(newEditorData);

    if (editor.current) {
      await editor.current.addWave(newSong);
    }
  };

  return (
    <>
      <div>
        <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={toggleStopPlay}>Stop</button>
        <input type="file" accept="audio/*" onChange={handleFileUpload} />
        <button
          onClick={() => {
            console.log(editor.current.export());
          }}
        >
          Export
        </button>
      </div>
      <div id="bmates" className="bmates" style={{ display: 'flex', height: '100vh' }}>
        <div
          id="bmates-sidebar"
          className="bmates-sidebar"
          style={{ width: `${style.sidebar.width}px`, flexShrink: 0 }}
        >
          <div
            className="bmates-sidebar-head"
            style={{ height: `${style.timeline.height + style.wave.margin / 2}px` }}
          ></div>
          <div className="bmates-sidebar-body">
            {data.map(item =>
              item.tracks.map(track => (
                <div
                  key={`${item.name}_${track.category}`}
                  className="bmates-track"
                  style={{ height: `${style.wave.height + style.wave.margin}px` }}
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
    </>
  );
};

export default BMates;
