import { Node } from '../engine';

export type EventType =
  | 'click'
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'mouseleave'
  | 'mouseover'
  | 'mouseout'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'dragstart'
  | 'draging'
  | 'dragend'
  | 'wave-dragstart'
  | 'wave-draging'
  | 'wave-dragend'
  | 'pause'
  | string;

export interface EventData {
  target: Node;
  point?: {
    x: number;
    y: number;
  };
  originalEvent?: MouseEvent;
  bubble?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  [key: string]: unknown;
}

export type EventHandler = (event: EventData) => void;
