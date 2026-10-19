type EventHandler = (...args: any[]) => void;

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
