import { EventData, EventHandler, EventType } from '../types';
import { Container } from './Container';

export class Statable {
  private events: Map<EventType, Set<EventHandler>> = new Map();
  parent: Container | null = null;

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
    const handlers = this.events.get(eventType);
    handlers?.forEach(handler => handler(eventData));

    if (eventBubble && (eventData.bubble ?? true)) this.parent?.call(eventType, eventData, eventBubble);
  }
}
