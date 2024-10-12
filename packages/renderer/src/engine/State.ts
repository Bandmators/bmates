import { EventData, EventHandler, EventType } from '../types';
import { Container } from './Container';

export class Statable {
  private events: Map<EventType, Set<EventHandler>> = new Map();
  parent: Container | null = null;

  on<T extends EventType>(eventType: T, handler: EventHandler<T>) {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, new Set());
    }
    this.events.get(eventType)!.add(handler);
  }

  off<T extends EventType>(eventType: T, handler: EventHandler<T>) {
    this.events.get(eventType)?.delete(handler);
  }

  call<T extends EventType>(eventType: T, eventData: EventData, eventBubble = true) {
    const handlers = this.events.get(eventType);
    handlers?.forEach(handler => handler(eventData));

    if (eventBubble && (eventData.bubble ?? true)) this.parent?.call(eventType, eventData, eventBubble);
  }
}
