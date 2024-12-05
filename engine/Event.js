class Event {
    constructor() {
        this.listeners = [];
    }

    /**
     * Connects a listener to the event.
     * @param {Function} callback - The function to call when the event is fired.
     */
    Connect(callback) {
        this.listeners.push(callback);
        return {
            Disconnect: () => {
                this.listeners = this.listeners.filter(listener => listener !== callback);
            }
        };
    }

    /**
     * Fires the event, calling all connected listeners.
     * @param  {...any} args - Arguments to pass to the listeners.
     */
    Fire(...args) {
        this.listeners.forEach(callback => callback(...args));
    }
}

// Export as the default export
export default Event;
