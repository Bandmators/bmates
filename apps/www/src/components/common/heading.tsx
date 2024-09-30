'use client';

import styled from '@emotion/styled';

import { maxMedia } from '@/libs/media';

export const H2 = styled.h2`
  margin-top: 9rem;
  position: relative;
  ${maxMedia.tablet} {
    margin-top: 5rem;
  }
  ${maxMedia.mobile} {
    margin-top: 3rem;
  }
  &::after {
    content: '.';
    font-size: 2rem;
    color: var(--secondary);
    position: absolute;
    bottom: -0.25rem;
  }
`;
