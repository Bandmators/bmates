'use client';

import { darkColors, layout, lightColors } from '@/styles/theme';
import { Theme, css } from '@emotion/react';

import { maxMedia } from '@/libs/media';
import { cssCustomProperties } from '@/utils/format';

const GlobalStyle = (theme: Theme) => css`
  *,
  ::after,
  ::before {
    box-sizing: border-box;
  }

  :root {
    --delay: 0.2s;
    ${cssCustomProperties(lightColors)}
    ${cssCustomProperties(layout)}
  }

  html[data-theme='dark'] {
    ${cssCustomProperties(darkColors)}
  }

  ::selection {
    color: var(--black);
    background: var(--grey);
  }
  ::-moz-selection {
    color: var(--black);
    background: var(--grey);
  }

  html,
  body {
    margin: 0px;
    padding: 0px;
  }

  body {
    color: var(--black);
    background-color: var(--white);
    &.modal-open {
      overflow: hidden;
      padding-right: 1rem;
    }
    &.hidden {
      overflow: hidden;
    }
    @media print {
      background-color: transparent;
    }
  }

  a {
    text-decoration: inherit;
    font-weight: 500;
    color: var(--primary);
  }

  p {
    font-weight: 400;
    font-size: ${theme.fontSizes.p};
    margin-top: 1rem;
    margin-bottom: 1rem;
    line-height: 1.75;
    ${maxMedia.mobile} {
      font-size: ${theme.fontSizes.mobile_p};
    }
    code {
      font-family: var(--Barlow);
      background-color: var(--asideBG);
      padding: 0.125rem 0.375rem;
      border-radius: 0.5rem;
      font-size: 90%;
      margin: 0rem 0.125rem;
    }
  }
  li code {
    font-family: var(--Barlow);
    background-color: var(--asideBG);
    padding: 0.125rem 0.375rem;
    border-radius: 0.5rem;
    font-size: 80%;
    margin: 0rem 0.125rem;
  }

  b,
  strong {
    font-weight: 700;
  }

  hr {
    border: none;
    border-top: 1px solid var(--hr);
    margin-top: 4rem;
    margin-bottom: 4rem;
  }

  h1 {
    font-weight: 800;
    font-size: ${theme.fontSizes.h1};
    margin-top: 0rem;
    margin-bottom: 0.25rem;
    ${maxMedia.mobile} {
      font-size: ${theme.fontSizes.mobile_h1};
    }
  }

  h2 {
    font-size: ${theme.fontSizes.h2};
    margin-top: 2rem;
    margin-bottom: 0.5rem;
  }

  h3 {
    font-size: ${theme.fontSizes.h3};
    margin-top: 1.75rem;
    margin-bottom: 0.5rem;
  }

  h4 {
  }
  h5 {
  }
  h6 {
  }

  blockquote {
    background-color: var(--blockquoteBG);
    border-left: var(--black) 2px solid;
    padding: 5px 0px 2px 14px;
    margin: 1rem 0rem;
    p {
      margin: 0rem 0rem 0.25rem 0rem;
    }
    a {
      text-decoration: underline;
    }
  }

  ol li,
  ul li {
    font-size: ${theme.fontSizes.p};
    margin-bottom: 0.5rem;
    ol,
    ul {
      margin-top: 0.75rem;
    }
  }

  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.875rem;
    text-align: left;
    margin: 1rem 0rem 1rem 0rem;
  }
  th,
  td {
    padding: 10px;
    border: 1px solid var(--hr);
    code {
      font-family: var(--Barlow);
      background-color: var(--asideBG);
      padding: 0.125rem 0.375rem;
      border-radius: 0.5rem;
      font-size: 80%;
      margin: 0rem 0.125rem;
    }
  }
  th {
    background-color: var(--blockquoteBG);
    font-weight: 400;
  }
  td {
    color: var(--black);
    opacity: 0.7;
  }

  .video-container {
    position: relative;
    margin: 2rem 0rem;
    padding-bottom: 56.25%;
    width: 100%;
    height: 445.5px;
    overflow: hidden;
    iframe,
    object,
    embed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  pre {
    &::-webkit-scrollbar {
      width: 1px;
      height: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--grey);
      border-radius: 10px;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
      border-radius: 10px;
      background-clip: padding-box;
    }
  }
`;

export default GlobalStyle;
