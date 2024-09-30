import { breakpoints } from '@/styles/theme';

const generateMediaQuery = (breakpoint: string, scaling: 'min' | 'max' = 'min') =>
  `@media screen and (${scaling}-width: ${breakpoint})`;

export const minMedia = {
  mobile: generateMediaQuery(breakpoints.mobile),
  tablet: generateMediaQuery(breakpoints.tablet),
  desktop: generateMediaQuery(breakpoints.desktop),
  desktopLarge: generateMediaQuery(breakpoints.desktopLarge),
};

export const maxMedia = {
  mobile: generateMediaQuery(breakpoints.mobile, 'max'),
  tablet: generateMediaQuery(breakpoints.tablet, 'max'),
  desktop: generateMediaQuery(breakpoints.desktop, 'max'),
  desktopLarge: generateMediaQuery(breakpoints.desktopLarge, 'max'),
};
