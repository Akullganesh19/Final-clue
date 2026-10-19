class EventBus {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  on(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  emit(event: string, data: unknown) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks?.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
