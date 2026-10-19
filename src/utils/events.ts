type Listener<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on<T>(event: string, callback: Listener<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as Listener);
  }

  off<T>(event: string, callback: Listener<T>) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback as Listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T>(event: string, payload: T) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
