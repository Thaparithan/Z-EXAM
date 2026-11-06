// ==============================================================================
// Z-EXAM: Unified Toast Notification Event Dispatcher
// Works seamlessly in React components, async services, and file queues.
// ==============================================================================

class ToastService {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(toastItem) {
    this.listeners.forEach((cb) => {
      try {
        cb(toastItem);
      } catch (err) {
        console.error('Toast notification error:', err);
      }
    });
  }

  show(message, type = 'info', duration = 3500) {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    this.notify({ id, message, type, duration });
    return id;
  }

  success(message, duration = 3500) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  info(message, duration = 3500) {
    return this.show(message, 'info', duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }
}

export const toast = new ToastService();

