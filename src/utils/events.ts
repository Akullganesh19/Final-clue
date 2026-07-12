type EventHandler = (...args: any[]) => void;

class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(handler => handler(...args));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();