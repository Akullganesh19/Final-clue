import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// A mock fragile dependency that fails frequently
let attemptCount = 0;
export async function callFragileDependency() {
  attemptCount++;
  // Fails on first two attempts, succeeds on third
  if (attemptCount % 3 !== 0) {
    throw new Error('Fragile dependency failed');
  }
  return { data: 'Success data from fragile dependency' };
}

// Reset function for testing
export function resetFragileDependency() {
  attemptCount = 0;
}

// Utility to sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Genesis self-healing: Auto-Retry with Exponential Backoff
export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
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

// Genesis: Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// A route that uses the fragile dependency but is protected by Genesis
app.get('/api/evidence', async (req, res) => {
  try {
    const result = await withRetry(callFragileDependency);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error(`[Error] /api/evidence failed: ${err.message}`);
    res.status(500).json({ success: false, error: 'Dependency failed after retries' });
  }
});

export { app };

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
