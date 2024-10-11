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
  name: string;
  mute?: boolean;
  group: number;
  songs: SongDataType<T>[];
};

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
    textY: number;
  };
  playhead: {
    color: string;
    width: number;
    height: number;
  };
  timeIndicator: {
    fill: string;
    font: string;
    top: number;
  };
  sidebar: {
    width: number;
  };
  wave: {
    height: number;
    borderRadius: number;
    margin: number;
    padding: number;
    disableAlpha: number;
    snapping: string;
    background: string;
    fill: string;
    border: string;
    predictionFill: string;
    selectedBorderColor: string;
  };
  context: {
    menuWidth: number;
    menuPadding: number;
    itemHeight: number;
    itemPadding: number;
  };
};

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type _EditorStyleType = DeepPartial<EditorStyleType>;
