/* eslint-disable @typescript-eslint/no-explicit-any */
export type SongDataType<T extends string = string> = {
  id: string;
  start: number;
  long?: number;
  src: string;
  user: string;
  group: number;
  instrument: T;
  mute?: boolean;
  lock?: boolean;
  [key: string]: any;
};
export type TrackDataType<T extends string = string> = {
  id: string;
  category: string;
  songs: SongDataType<T>[];
};
export type EditorDataType<T extends string = string> = {
  name: string;
  tracks: TrackDataType<T>[];
};
// export type BandData = {
//   start: number;
//   long: number;
//   src: string;
//   group: number;
//   user: string;
//   instrument: InstrumentType;
// };
export type EditorStyleType = {
  theme: {
    background: string;
    lineColor: string;
    strokeLineColor: string;
  };
  timeline: {
    gapHeight: number;
    gapWidth: number;
    timeDivde: number; // 5 or 10
    height: number; // 45 or 60;
  };
  sidebar: {
    width: number;
  };
  wave: {
    height: number;
    borderRadius: number;
    margin: number;
    snapping: string;
  };
  context: {
    menuWidth: number;
    menuPadding: number;
    itemHeight: number;
    itemPadding: number;
  };
};
