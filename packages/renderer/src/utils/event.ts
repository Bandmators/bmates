import { type Node } from '@/engine';
import { EventData, EventType } from '@/types';

export const dispatchEventData = (
  type: EventType,
  target: Node,
  point: {
    x: number;
    y: number;
  },
  originalEvent: MouseEvent,
  bubble: boolean = true,
) => {
  const eventData: EventData = { type, target, point, originalEvent, bubble };
  target.call(type, eventData, target !== this);
};
