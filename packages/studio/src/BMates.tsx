import { Editor, TrackDataType, _EditorStyleType } from '@bmates/editor';

import { Button, useToast } from 'bmates-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

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

const BMates = ({ data, style, trackEl }: BMatesProps) => {
  const [_data, setData] = useState<TrackDataType[]>(data);
  const ref = useRef<HTMLCanvasElement | null>(null);
  const editor = useRef<Editor | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ref.current && !editor.current) {
      editor.current = new Editor(ref.current, data, style);
      editor.current.on('data-change', () => {
        setData(editor.current?.export());
      });
      editor.current.on('pause', isPlaying => {
        // @ts-ignore
        setIsPlaying(isPlaying);
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

  const toggleMuteTrack = useCallback((trackId: string) => {
    editor.current?.muteTrack(trackId);
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    editor.current?.removeTrack(trackId);
  }, []);

  const download = () => {
    editor.current.downloadBlob('bmates_audio.mp3');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    if (editor.current) {
      await editor.current.addWaveBuffer(file, audioBuffer);
    }
  };

  return (
    <>
      <div className="toolbar">
        <Button variant="primary" onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="primary" onClick={toggleStopPlay}>
          Stop
        </Button>
        <input type="file" accept="audio/*" onChange={handleFileUpload} />
        <Button variant="primary" onClick={download}>
          Download
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            toast({
              title: 'Data extraction success!',
              description: 'Check the Developer Console (F12)',
              variant: 'primary',
              time: 7000,
            });
            console.log(`%c[ BMates Export Data ]`, 'background: black; color: white;');
            console.log('Result: ', editor.current.export());
          }}
        >
          Export
        </Button>
      </div>
      <div id="bmates" className="bmates" style={{ display: 'flex', height: '100%' }}>
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
    </>
  );
};

export default BMates;
