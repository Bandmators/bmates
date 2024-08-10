import { Node } from '../';

export type EventType = 'click' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseleave';

export interface EventData {
  type: EventType;
  target: Node;
  point: {
    x: number;
    y: number;
  };
  originalEvent: MouseEvent;
}

export type EventHandler = (event: EventData) => void;
