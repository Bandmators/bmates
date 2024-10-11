'use client';

import { BmatesProvider, useBMates } from '@bmates/studio';

import styled from '@emotion/styled';
import { Button, maxMedia, useToast } from 'bmates-ui';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { Container } from '@/components/common/grid/Container';
import { Layout } from '@/components/layout';

import { Editor, TrackDataType } from '../../../../packages/editor';
import { BMates } from '../../../../packages/studio';

const data: TrackDataType[] = [
  {
    id: 'TEMP0',
    name: 'Track 1',
    group: 0,
    songs: [
      {
        id: 'BMATEST0',
        src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/drum_0.mp3',
        user: '',
        start: 0,
        group: 0,
        instrument: 'Piano',
      },
      {
        id: 'BMATEST1',
        src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/drum_1.mp3',
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
        src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/guitar_0.mp3',
        user: '',
        start: 3,
        group: 1,
        instrument: 'Piano',
      },
      {
        id: 'BMATEST4',
        src: 'https://baggun.s3.ap-northeast-2.amazonaws.com/voice/piano_0.mp3',
        user: '',
        start: 10.0,
        group: 1,
        instrument: 'Guitar',
      },
    ],
  },
];

const style = {
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
    width: 200,
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

export default function Home() {
  const editorRef = useRef<Editor>(null);

  return (
    <Layout>
      <IntroSection>
        <h1>BMates</h1>
        <h2>Open-source Web Audio editor</h2>
        <p>
          BMates is a powerful tool that helps users easily edit music.
          <br />
          With an intuitive interface and a variety of features, anyone can create audio projects effortlessly.
        </p>
        <Link href="/docs/getting-started">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
        </Link>
        <Features>
          <Feature>Free and open-source</Feature>
          <Feature>Easy Customization</Feature>
          <Feature>Awesome UI/UX</Feature>
          <Feature>Simple API</Feature>
        </Features>
      </IntroSection>
      <DemoSection id="demo">
        <Container>
          <BMatesWrapper>
            <BmatesProvider editorRef={editorRef}>
              <ControlPanel />
              <BMatesStyled
                data={data}
                style={style}
                trackEl={({ track, muted, toggleMute, removeTrack }) => {
                  return (
                    <Track>
                      <TrackName>{track.name}</TrackName>
                      <TrackFeature>
                        <ToggleMute muted={muted} onClick={toggleMute} />
                        <RemoveTrackButton onClick={removeTrack}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path>
                          </svg>
                        </RemoveTrackButton>
                      </TrackFeature>
                    </Track>
                  );
                }}
              />
            </BmatesProvider>
          </BMatesWrapper>
        </Container>
      </DemoSection>
      <SupportSection>
        <h2>Support our work</h2>
        <div>Any interest you have in this open source will support us.</div>
        <SupportItemList>
          <SupportItem>
            <h3>Contribute</h3>
            <div>
              You can contribute in various ways, including code, documentation, and design. Share your ideas and skills
              to help us enhance the project!
            </div>
          </SupportItem>
          <SupportItem>
            <h3>Share</h3>
            <div>
              If you build a project using this open source, please share it with us. We will strive for better open
              source.
            </div>
          </SupportItem>
          <SupportItem>
            <h3>Sponsor us</h3>
            <div>
              Your sponsorship directly impacts the maintenance and improvement of our project. We would greatly
              appreciate your support.
            </div>
          </SupportItem>
        </SupportItemList>
      </SupportSection>
    </Layout>
  );
}

const ToggleMute = ({ muted, onClick }: { muted: boolean; onClick: () => void }) => {
  const [isMuted, setIsMuted] = useState<boolean>(muted);

  return (
    <Button
      size="icon"
      onClick={() => {
        onClick();
        setIsMuted(!isMuted);
      }}
    >
      {isMuted ? (
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

const RemoveTrackButton = ({ onClick, children }: { onClick?: () => void; children?: React.ReactElement }) => {
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
  const { isPlaying, togglePlay, toggleStopPlay, handleFileUpload, download, editorRef } = useBMates();
  const { toast } = useToast();

  return (
    <ControlPanelStyled>
      <div className="collapse">
        <Button variant="primary" onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="primary" onClick={toggleStopPlay}>
          Stop
        </Button>
        <input type="file" accept="audio/*" onChange={handleFileUpload} />
      </div>
      <div className="collapse">
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
            console.log('Result: ', editorRef.current?.export());
          }}
        >
          Export
        </Button>
      </div>
    </ControlPanelStyled>
  );
};

const IntroSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10rem;
  background: var(--white);
  font-size: 1rem;
  h2 {
    margin-top: 0.5rem;
  }
  p {
    margin: 2rem 0rem;
  }
  button {
    box-shadow: 0px 0px 10px var(--primary);
  }
  ${maxMedia.tablet} {
    padding: 3rem 1rem;
    flex-basis: calc(50% - 1rem);
  }
`;

const Features = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
`;

const Feature = styled.div`
  margin: 1rem;
  padding: 1rem;
  background: var(--gray-100);
  border-radius: 8px;
  font-weight: 300;
  ${maxMedia.tablet} {
    flex-basis: calc(40%);
  }
`;

const BMatesWrapper = styled.div`
  height: 60rem;
  border-radius: 0.5rem;
  box-shadow: 0px 0px 10px var(--gray-300);
  overflow: hidden;
  background: var(--background);
  padding: 1rem;
  .bmates-sidebar {
    border: 1px solid #c9c9c9;
  }

  .bmates-sidebar .bmates-track {
    padding: 1rem;
    border-top: 1px solid #c9c9c9;
  }
`;

const ControlPanelStyled = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  justify-content: space-between;
  .collapse {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
`;

const DemoSection = styled.section`
  padding: 10rem 0rem;
  background: var(--gray-200);
  display: flex;
  align-items: center;
`;

const BMatesStyled = styled(BMates)`
  background: var(--background);
`;

const Track = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;
const TrackName = styled.div`
  font-weight: 500;
  font-size: 1.125rem;
  @media (max-width: 768px) {
    display: none;
  }
`;
const TrackFeature = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: space-between;
    gap: 0px;
    height: 100%;
  }
`;
const SupportSection = styled.section`
  padding: 5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${maxMedia.tablet} {
    padding: 5rem 1rem;
  }
`;

const SupportItemList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4rem;
  gap: 1rem;
  max-width: 70rem;
  ${maxMedia.tablet} {
    flex-direction: column;
  }
`;

const SupportItem = styled.div`
  margin: 2rem 0;
  flex: 1;
  ${maxMedia.tablet} {
    margin: 0rem 0;
  }
  h2 {
    margin: 1rem 0;
  }
`;
