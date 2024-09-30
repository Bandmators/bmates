import { type Node } from '../engine';
import { EventData, EventType } from '../types';

export const dispatchEventData = (
  type: EventType,
  target: Node,
  point: {
    x: number;
    y: number;
  },
  originalEvent: MouseEvent,
  bubble: boolean = true,
  data?: object,
) => {
  const eventData: EventData = { target, point, originalEvent, bubble, data };
  target.call(type, eventData, target !== this);
};

export const replaceEventDataType = (type: EventType, evt: EventData): EventData => {
  const eventData = { ...evt, type };
  return eventData;
};

export const appendDataAtEventData = (evt: EventData, data: object): EventData => {
  const eventData = { ...evt, data: { ...(evt.data || {}), ...data } };
  return eventData;
};
