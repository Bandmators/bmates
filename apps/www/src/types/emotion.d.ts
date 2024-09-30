import { BreakpointsType, ColorsType, FontSizesType } from '@/styles/theme';
import '@emotion/react';

type ColorsType = typeof colors;
type FontSizesType = typeof fontSizes;
type BreakpointsType = typeof breakpoints;
type LayoutType = typeof layout;

declare module '@emotion/react' {
  export interface Theme {
    colors: ColorsType;
    fontSizes: FontSizesType;
    breakpoints: BreakpointsType;
    layout: LayoutType;
  }
}
