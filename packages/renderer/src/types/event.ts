import { Node } from '@/engine';

export type EventType =
  | 'click'
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'mouseleave'
  | 'mouseover'
  | 'mouseout'
  | 'dragstart'
  | 'draging'
  | 'dragend'
  | 'wave-dragstart'
  | string;

export interface EventData {
  target: Node;
  point: {
    x: number;
    y: number;
  };
  originalEvent: MouseEvent;
  bubble: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export type EventHandler = (event: EventData) => void;
