import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Final Clue Server'));
if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
export default app;
