import { Theme } from '@emotion/react';

/**
 * 테마에 상관없이 항상 기본이 되는 값
 */
export const baseColors = {
  black: '#222',
  white: '#fCfCff',
  deepGrey: '#797979',
};

/**
 * Light 테마
 */
export const lightColors = {
  grey: '#d9d9d9',
  hr: '#e1e1e1',
  white: '#fCfCff',
  blockquoteBG: '#efefef',
  asideBG: '#ededed',
  highlight: '#d0d1ff',
};

/**
 * Dark 테마
 */
export const darkColors = {
  grey: '#3C3C3E',
  hr: '#3C3C3E',
  blockquoteBG: '#2b2b2b',
  asideBG: '#272727',
  highlight: '##d0d1ff',
};

export const layout = {
  sidebarWidth: '314px',
  layoutHeader: '60px',
};

/**
 * Dark 테마
 */
export const fontSizes = {
  p: '16px',
  mobile_p: '16px',

  desc: '1.25rem',
  refer: '0.75rem',

  h1: '2.25rem',
  mobile_h1: '1.875rem',
  h2: '1.625rem',
  // mobile_h1: "1.875rem",
  h3: '1.25rem',

  small: '14px',
  medium: '16px',
  title: '42px',
  subtitle: '20px',
};

/**
 * Dark 테마
 */
export const breakpoints = {
  desktopLarge: '1200px',
  desktop: '1024px',
  tablet: '768px',
  mobile: '576px',
};

/**
 * Dark 테마
 */
const baseTheme: Theme = {
  colors: baseColors,
  fontSizes,
  breakpoints,
  layout,
};
export default baseTheme;
