import express from 'express';
import dotenv from 'dotenv';
import weatherRoutes from './routes/weatherRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Modify root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.use('/api', weatherRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});