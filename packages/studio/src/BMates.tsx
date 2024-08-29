import { Editor, EditorDataType, EditorStyleType, TrackDataType } from '@bmates/editor';

import { useRef } from 'react';
import { useCallback, useEffect, useState } from 'react';

import AudioPlayer from './AudioPlayer';

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

  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const newPlayer = new AudioPlayer();
    setPlayer(newPlayer);

    return () => {
      if (isPlaying) {
        newPlayer.stop();
      }
    };
  }, []);

  const initializeAudio = useCallback(async () => {
    if (player && !isInitialized) {
      const state = player.initialize();
      if (state === 'running') {
        setIsInitialized(true);
        // 트랙 준비 로직
        for (const item of data) {
          for (const track of item.tracks) {
            for (const song of track.songs) {
              const trackId = `${song.group}-${song.instrument}`;
              await player.prepareTrack(song, trackId);
            }
          }
        }
      }
    }
  }, [player, isInitialized]);

  const togglePlay = useCallback(() => {
    if (player && isInitialized) {
      if (isPlaying) {
        player.stop();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    } else if (player && !isInitialized) {
      initializeAudio();
    }
  }, [player, isPlaying, isInitialized, initializeAudio]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleMute = useCallback(
    (trackId: string) => {
      if (player && isInitialized) {
        player.mute(trackId, !player.isMuted(trackId));
      }
    },
    [player, isInitialized],
  );

  return (
    <>
      <div>
        <button
          onClick={() => {
            togglePlay();
            editor.current?.play();
          }}
        >
          Play
        </button>
        <button
          onClick={() => {
            togglePlay();
            editor.current?.stop();
          }}
        >
          Stop
        </button>
        <button
          onClick={() => {
            editor.current?.pause();
          }}
        >
          Pause
        </button>
        <button onClick={togglePlay}>{isInitialized ? (isPlaying ? 'Stop' : 'Play') : 'Initialize'} Audio</button>
      </div>
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
    </>
  );
};
export default BMates;
