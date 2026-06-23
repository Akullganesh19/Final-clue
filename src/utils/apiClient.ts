const pendingRequests = new Map<string, Promise<Response>>();

export const dedupedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  if (init?.method && init.method !== 'GET') {
    return fetch(input, init);
  }

  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const key = `${url}-${JSON.stringify(init)}`;

  if (pendingRequests.has(key)) {
    const res = await pendingRequests.get(key)!;
    return res.clone(); // return a clone so callers can consume the body multiple times
  }

  const fetchPromise = fetch(input, init)
    .then((res) => {
      pendingRequests.delete(key);
      return res;
    })
    .catch((err) => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, fetchPromise);

  const res = await fetchPromise;
  return res.clone();
};
