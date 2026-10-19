export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.log(`[Genesis Recovery] Attempt ${attempt} failed, retrying...`);
      if (attempt === maxAttempts) throw err;
      await sleep(100 * Math.pow(2, attempt - 1));
    }
  }
  throw new Error('Unreachable');
}
