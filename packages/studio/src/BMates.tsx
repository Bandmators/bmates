import { Editor, EditorDataType, EditorStyleType, SongDataType, TrackDataType, generateUniqueId } from '@bmates/editor';

import { Button } from 'bmates-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DeepPartial } from '@/types/type';

interface BMatesProps {
  data: EditorDataType[];
  style?: DeepPartial<EditorStyleType>;
  trackEl?: ({ track, muted }: { track: TrackDataType; muted: boolean; toggleMute: () => void }) => JSX.Element;
}

const BMates = ({ data, style, trackEl }: BMatesProps) => {
  const [_data, setData] = useState<EditorDataType[]>(data);
  const ref = useRef<HTMLCanvasElement | null>(null);
  const editor = useRef<Editor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (ref.current && !editor.current) {
      editor.current = new Editor(ref.current, data, style);
      editor.current.on('data-change', () => {
        setData(editor.current?.data ? [...editor.current.data] : []);
      });
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

  const toggleMute = useCallback((trackId: string) => {
    editor.current?.mute(trackId);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const newSong: SongDataType = {
      id: generateUniqueId(),
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
    // const newTrack: TrackDataType = {
    //   id: generateUniqueId(),
    //   category: 'New Track',
    //   songs: [newSong],
    // };
    // const newEditorData: EditorDataType = {
    //   name: 'New Track',
    //   tracks: [newTrack],
    // };

    // data.push(newEditorData);

    if (editor.current) {
      await editor.current.addWave(newSong);
    }
  };

  return (
    <>
      <div>
        <Button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</Button>
        <Button onClick={toggleStopPlay}>Stop</Button>
        <input type="file" accept="audio/*" onChange={handleFileUpload} />
        <Button
          onClick={() => {
            console.log(editor.current.export());
          }}
        >
          Export
        </Button>
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
            {_data.map(item =>
              item.tracks.map(track => (
                <div
                  key={`${item.name}_${track.category}`}
                  className="bmates-track"
                  style={{ height: `${style.wave.height + style.wave.margin}px` }}
                >
                  {trackEl({ track, muted: false, toggleMute: () => toggleMute(track.id) })}
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
