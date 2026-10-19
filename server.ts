import express from 'express';
const app = express();
app.get('/api', (req, res) => res.send('ok'));
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.cjs')) {
  app.listen(3000, () => console.log('Listening on 3000'));
}
export default app;
