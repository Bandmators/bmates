export type SongDataType<T extends string = string> = {
  start: number;
  long: number;
  src: string;
  user: string;
  group: number;
  instrument: T;
  [key: string]: unknown;
};
export type TrackDataType<T extends string = string> = {
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
  };
};
