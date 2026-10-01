export type { ProjectData, SongDataType, TrackDataType } from '@bmates/core';

export type _EditorStyleType = {
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
    mobileWidth: number;
    mobileViewport: number;
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

export type EditorStyleType = DeepPartial<_EditorStyleType>;

export type ResolvedEditorStyleType = _EditorStyleType;

export interface EditorHistoryController {
  redo: () => Promise<void> | void;
  undo: () => Promise<void> | void;
}

export const DEFAULT_EDITOR_STYLE: ResolvedEditorStyleType = {
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
    textY: -3,
  },
  playhead: {
    color: '#FF000099',
    width: 5,
    height: 10,
  },
  timeIndicator: {
    fill: '#000',
    font: '12px Arial',
    top: 15,
  },
  sidebar: {
    width: 300,
    mobileWidth: 60,
    mobileViewport: 768,
  },
  wave: {
    height: 45,
    borderRadius: 8,
    margin: 10,
    padding: 8,
    disableAlpha: 0.5,
    snapping: 'rgb(0, 0, 0, 0.6)',
    background: '#c3c3c3',
    fill: 'rgb(122, 122, 122)',
    border: 'rgb(0, 0, 0, 0.6)',
    predictionFill: '#c3c3c388',
    selectedBorderColor: 'rgba(123, 123, 123, 0.5)',
  },
  context: {
    menuWidth: 200,
    menuPadding: 10,
    itemHeight: 40,
    itemPadding: 10,
  },
};
