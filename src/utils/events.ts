type EventHandler = (...args: any[]) => void;

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, callback: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventHandler): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      // Use forEach instead of for...of to avoid TS2802
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Global singleton instance
export const eventBus = new EventBus();
