import express from 'express';
const app = express();
app.get('/api', (req, res) => res.send('API'));
if (process.argv[1]?.includes('server.ts')) {
    app.listen(3000, () => console.log('Server running'));
}
