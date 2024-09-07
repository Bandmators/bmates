import { Node } from '@/engine';

export type EventType = 'click' | 'mousemove' | 'mousedown' | 'mouseup' | 'mouseleave' | 'mouseover' | 'mouseout';

export interface EventData {
  type: EventType;
  target: Node;
  point: {
    x: number;
    y: number;
  };
  originalEvent: MouseEvent;
  bubble: boolean;
}

export type EventHandler = (event: EventData) => void;
