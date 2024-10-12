/* eslint-disable @typescript-eslint/no-explicit-any */
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

// export interface EventData {
//   target: Node;
//   point?: {
//     x: number;
//     y: number;
//   };
//   originalEvent?: MouseEvent | TouchEvent;
//   bubble?: boolean;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   data?: any;
//   [key: string]: unknown;
// }

// export type EventHandler = (event: EventData) => void;

export interface EventDataMap {
  click: MouseEvent;
  mousedown: MouseEvent;
  mouseup: MouseEvent;
  mousemove: MouseEvent;
  mouseleave: MouseEvent;
  mouseover: MouseEvent;
  mouseout: MouseEvent;
  touchstart: TouchEvent;
  touchmove: TouchEvent;
  touchend: TouchEvent;
  dragstart: DragEvent;
  draging: DragEvent;
  dragend: DragEvent;
  'wave-dragstart': Event;
  'wave-draging': Event;
  'wave-dragend': Event;
  pause: Event;
}

export type EventData<T extends EventType = EventType> = {
  target: Node;
  point?: {
    x: number;
    y: number;
  };
  originalEvent?: T extends keyof EventDataMap ? EventDataMap[T] : any;
  bubble?: boolean;
  data?: any;
  [key: string]: unknown;
};

export type EventHandler<T extends EventType = EventType> = (event: EventData<T>) => void;
