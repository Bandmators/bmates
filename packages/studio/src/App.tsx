import { EditorStyleType, TrackDataType } from '@bmates/editor';

import { BMatesProvider as BMatesUIProvider, Button, useToast } from 'bmates-ui';
import { ChangeEvent } from 'react';

import './App.css';
import { BMates } from './BMates';
import { useBMatesSelector, useBMatesStore } from './BMatesComposer';
import { DeepPartial } from './types/type';

const data: TrackDataType[] = [
  {
    id: 'TEMP0',
    name: 'Track 1',
    group: 0,
    songs: [
      {
        id: 'BMATEST0',
        src: 'https://bandmators.github.io/bmates/audio/drum_0.mp3',
        user: '',
        start: 0,
        group: 0,
        instrument: 'Piano',
      },
      {
        id: 'BMATEST1',
        src: 'https://bandmators.github.io/bmates/audio/drum_1.mp3',
        user: '',
        start: 9,
        group: 0,
        instrument: 'Drum',
      },
    ],
  },
  {
    id: 'TEMP1',
    name: 'Track 2',
    group: 1,
    songs: [
      {
        id: 'BMATEST3',
        src: 'https://bandmators.github.io/bmates/audio/guitar_0.mp3',
        user: '',
        start: 3,
        group: 1,
        instrument: 'Piano',
      },
      {
        id: 'BMATEST4',
        src: 'https://bandmators.github.io/bmates/audio/piano_0.mp3',
        user: '',
        start: 10.0,
        group: 1,
        instrument: 'Guitar',
      },
    ],
  },
];

const style: DeepPartial<EditorStyleType> = {
  theme: {
    background: 'white',
    lineColor: '#e3e3e3',
    strokeLineColor: '#999999',
  },
  timeline: {
    gapHeight: 10,
    gapWidth: 10,
    timeDivde: 10,
    height: 45,
  },
  sidebar: {
    width: 300,
    mobileWidth: 60,
    mobileViewport: 768,
  },
  wave: {
    height: 95,
    borderRadius: 8,
    margin: 10,
    background: '#dad9db',
    fill: '#2e2c30',
  },
};

const ToggleMute = ({ muted, onClick }: { muted: boolean; onClick: () => void }) => {
  return (
    <Button size="icon" onClick={onClick}>
      {muted ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M12 3.75v16.5a.75.75 0 0 1-1.255.555L5.46 16H2.75A1.75 1.75 0 0 1 1 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805A.75.75 0 0 1 12 3.75ZM6.255 9.305a.748.748 0 0 1-.505.195h-3a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h3c.187 0 .367.069.505.195l4.245 3.86V5.445ZM16.28 8.22a.75.75 0 1 0-1.06 1.06L17.94 12l-2.72 2.72a.75.75 0 1 0 1.06 1.06L19 13.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L20.06 12l2.72-2.72a.75.75 0 0 0-1.06-1.06L19 10.94l-2.72-2.72Z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
          <path d="M11.553 3.064A.75.75 0 0 1 12 3.75v16.5a.75.75 0 0 1-1.255.555L5.46 16H2.75A1.75 1.75 0 0 1 1 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805a.752.752 0 0 1 .808-.13ZM10.5 5.445l-4.245 3.86a.748.748 0 0 1-.505.195h-3a.25.25 0 0 0-.25.25v4.5c0 .138.112.25.25.25h3c.187 0 .367.069.505.195l4.245 3.86Zm8.218-1.223a.75.75 0 0 1 1.06 0c4.296 4.296 4.296 11.26 0 15.556a.75.75 0 0 1-1.06-1.06 9.5 9.5 0 0 0 0-13.436.75.75 0 0 1 0-1.06Z"></path>
          <path d="M16.243 7.757a.75.75 0 1 0-1.061 1.061 4.5 4.5 0 0 1 0 6.364.75.75 0 0 0 1.06 1.06 6 6 0 0 0 0-8.485Z"></path>
        </svg>
      )}
    </Button>
  );
};

const RemoveTrackButton = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  return (
    <Button
      size="icon"
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      {children ? children : 'Remove'}
    </Button>
  );
};

const ControlPanel = () => {
  const editor = useBMatesStore();
  const isPlaying = useBMatesSelector(state => state.isPlaying);
  const { toast } = useToast();

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await editor.addFile(file);
    } finally {
      event.target.value = '';
    }
  };
  const togglePlay = () => void editor.togglePlayback();
  const toggleStopPlay = () => editor.stop();
  const download = () => void editor.download();

  return (
    <div>
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
          console.log('Result: ', editor.exportProject());
        }}
      >
        Export
      </Button>
    </div>
  );
};

const App = () => (
  <BMatesUIProvider>
    <BMates.Root style={style} onError={error => console.error(error)}>
      <BMates.Project>
        {data.map(track => (
          <BMates.Track key={track.id} id={track.id} name={track.name} group={track.group} mute={track.mute}>
            {track.songs.map(clip => (
              <BMates.Clip
                key={clip.id}
                id={clip.id}
                instrument={clip.instrument}
                lock={clip.lock}
                long={clip.long}
                mute={clip.mute}
                src={clip.src}
                start={clip.start}
                user={clip.user}
              />
            ))}
          </BMates.Track>
        ))}
      </BMates.Project>
      <ControlPanel />
      <div id={'bmates'} className={'bmates'} style={{ display: 'flex', height: '100%' }}>
        <div className={'bmates-sidebar'} style={{ width: style.sidebar?.width, flexShrink: 0 }}>
          <div
            className={'bmates-sidebar-head'}
            style={{ height: (style.timeline?.height ?? 45) + (style.wave?.margin ?? 10) / 2 }}
          />
          <BMates.TrackList className={'bmates-sidebar-body'}>
            {({ track, muted, toggleMute, remove }) => (
              <div
                className={'bmates-track'}
                style={{ height: (style.wave?.height ?? 45) + (style.wave?.margin ?? 10) }}
              >
                <div className={'track'}>
                  <div className={'name'}>{track.name}</div>
                  <div className={'feature'}>
                    <ToggleMute muted={muted} onClick={toggleMute} />
                    <RemoveTrackButton onClick={remove}>Remove</RemoveTrackButton>
                  </div>
                </div>
              </div>
            )}
          </BMates.TrackList>
        </div>
        <BMates.Canvas style={{ flexGrow: 1 }} />
      </div>
    </BMates.Root>
  </BMatesUIProvider>
);

export default App;
