// Custom polyfill for web-streams
// This file provides a fallback when the original module can't be resolved

// Basic stream implementation
class ReadableStream {
  constructor(underlyingSource) {
    this._underlyingSource = underlyingSource;
  }
  
  getReader() {
    return {
      read: async () => {
        try {
          if (this._underlyingSource && this._underlyingSource.pull) {
            const data = await this._underlyingSource.pull();
            return { value: data, done: !data };
          }
          return { done: true };
        } catch (e) {
          console.error('ReadableStream error:', e);
          return { done: true };
        }
      },
      cancel: () => {},
      releaseLock: () => {}
    };
  }
}

// Export the polyfill
module.exports = {
  ReadableStream
};
