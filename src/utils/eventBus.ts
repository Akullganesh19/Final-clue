type EventHandler<T = any> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on<T>(event: string, callback: EventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return an unsubscribe function
    return () => this.off(event, callback);
  }

  off<T>(event: string, callback: EventHandler<T>): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emit<T>(event: string, data: T): void {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)!) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in EventBus listener for event '${event}':`, error);
        }
      }
    }
  }
}

export const eventBus = new EventBus();
