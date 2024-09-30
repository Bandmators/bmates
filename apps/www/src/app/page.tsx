'use client';

import styled from '@emotion/styled';
import { Button } from 'bmates-ui';
import Link from 'next/link';
import { useState } from 'react';

import { Container } from '@/components/common/grid/Container';
import { Layout } from '@/components/layout';

import { EditorDataType } from '../../../../packages/editor/src';
import BMates from '../../../../packages/studio/src/BMates';

const data: EditorDataType[] = [
  {
    name: 'bgm',
    tracks: [
      {
        id: 'TEMP0',
        category: 'Category 1',
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
    ],
  },
  {
    name: 'effect',
    tracks: [
      {
        id: 'TEMP1',
        category: 'Category 2',
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
  },
  wave: {
    height: 95,
    borderRadius: 8,
    margin: 10,
  },
};

export default function Home() {
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
      <DemoSection>
        <Container>
          <BMatesContainer>
            <BMatesStyled
              data={data}
              style={style}
              trackEl={({ track, muted, toggleMute }) => {
                return (
                  <div className="track">
                    <div>{track.category}</div>
                    <ToggleMute muted={muted} onClick={toggleMute} />
                  </div>
                );
              }}
            />
          </BMatesContainer>
        </Container>
      </DemoSection>
    </Layout>
  );
}

const ToggleMute = ({ muted, onClick }: { muted: boolean; onClick: () => void }) => {
  const [isMuted, setIsMuted] = useState<boolean>(muted);

  return (
    <Button
      onClick={() => {
        onClick();
        setIsMuted(!isMuted);
      }}
    >
      {isMuted ? 'Unmute' : 'Mute'}
    </Button>
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
`;

const Features = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4rem;
`;

const Feature = styled.div`
  margin: 0 1rem;
  padding: 1rem;
  background: var(--gray-100);
  border-radius: 8px;
  font-weight: 300;
`;

export const BMatesContainer = styled.div`
  height: 60rem;
  border-radius: 0.5rem;
  box-shadow: 0px 0px 10px var(--gray-300);
  overflow: hidden;
  background: var(--background);
  padding: 1rem;
`;

export const DemoSection = styled.section`
  height: 100vh;
  background: var(--gray-200);
  display: flex;
  align-items: center;
`;

const BMatesStyled = styled(BMates)`
  background: var(--background);
`;
