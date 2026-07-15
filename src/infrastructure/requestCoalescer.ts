const originalFetch = globalThis.fetch;

export function initializeRequestCoalescer() {
  const inFlight = new Map<string, Promise<Response>>();

  globalThis.fetch = async function coalescedFetch(
    input: string | URL | globalThis.Request,
    init?: RequestInit
  ): Promise<Response> {
    // Extract request details to determine if we should coalesce
    let method = 'GET';
    let urlString = '';
    let mergedInit = { ...init };

    if (input instanceof Request) {
      method = input.method || 'GET';
      urlString = input.url;
      // Copy over essential headers and signal from the Request object
      if (!mergedInit.headers) {
        mergedInit.headers = input.headers;
      }
      if (!mergedInit.signal) {
        mergedInit.signal = input.signal;
      }
      // Cannot reliably extract body from Request for deduplication keys,
      // but we only coalesce GET requests anyway.
    } else {
      urlString = input.toString();
      method = mergedInit.method || 'GET';
    }

    // Only coalesce safe, idempotent GET requests without a body
    if (method.toUpperCase() !== 'GET') {
      return originalFetch(input, init);
    }

    // Generate a unique cache key based on URL and headers
    // For simplicity, we just use the URL string.
    // In a more complex scenario, headers would need to be considered.
    const cacheKey = urlString;

    if (inFlight.has(cacheKey)) {
      console.log(`[Phantom] Coalescing duplicate request to: ${cacheKey}`);
      const existingPromise = inFlight.get(cacheKey)!;
      // Return a cloned response to prevent "body stream already read" errors
      return existingPromise.then(response => response.clone());
    }

    // Start a new fetch
    const fetchPromise = originalFetch(input, init)
      .then(response => {
        // Only keep successful responses in the flight cache while returning?
        // Actually, we want to share the promise regardless of outcome during flight,
        // so we don't duplicate failed requests simultaneously either.
        return response;
      })
      .finally(() => {
        // Remove from flight tracking once complete
        inFlight.delete(cacheKey);
      });

    inFlight.set(cacheKey, fetchPromise);

    return fetchPromise.then(response => response.clone());
  };
}

// Function for testing purposes to reset fetch
export function _resetFetch() {
  globalThis.fetch = originalFetch;
}
