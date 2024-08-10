import { EventData, EventHandler, EventType } from './types';

export class Statable {
  events: Map<EventType, Set<EventHandler>> = new Map();
  parent: Statable | null = null;

  on(eventType: EventType, handler: EventHandler) {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    this.events.get(eventType)!.add(handler);
  }

  off(eventType: EventType, handler: EventHandler) {
    this.events.get(eventType)?.delete(handler);
  }

  call(eventType: string, eventData: EventData, eventBubble = true) {
    const handlers = this.events.get(eventData.type);
    handlers?.forEach(handler => handler(eventData));

    if (eventBubble) this.parent?.call(eventType, eventData, eventBubble);
  }
}
