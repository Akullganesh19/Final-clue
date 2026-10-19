import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Final Clue API'));
if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Server running'));
}
export default app;
