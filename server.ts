import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { withRetry, CircuitBreaker } from './src/utils/resilience.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const aiCircuitBreaker = new CircuitBreaker(3, 30000); // Trip after 3 failures, wait 30s

app.get('/api/analyze/:id', async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

    // Protected call: wrapped in Circuit Breaker + Retry
    const result = await aiCircuitBreaker.execute(
      async () => {
        return await withRetry(
          async () => {
            // Simulate potential failure
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("API Key missing or invalid");
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: 'Analyze this case...',
            });
            return response.text;
          },
          3, // max attempts
          200, // initial delay
          'Gemini API Generation'
        );
      },
      async () => {
        // Fallback: Graceful degradation when AI fails
        console.warn("[GENESIS] Returning degraded fallback analysis due to AI failure.");
        return "Analysis unavailable at this time due to system issues. Basic link information: Suspect linked to vehicle.";
      },
      'Gemini API'
    );

    res.json({ analysis: result });
  } catch (error) {
    console.error("Critical Analysis Failure", error);
    res.status(500).json({ error: "Failed to analyze case" });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
