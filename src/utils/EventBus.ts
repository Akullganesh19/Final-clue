type EventCallback = (...args: any[]) => void;

class EventBusService {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[EventBus] Error in listener for event ${event}:`, error);
        }
      });
    }
  }

  // Only used for testing to clear out state
  clear(): void {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusService();
