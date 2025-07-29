import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import stocksRouter from './routes/stocks.js';

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/stocks', stocksRouter);
app.use('/tab2', express.static(path.join(__dirname, 'public', 'tab2.html')));

app.listen(PORT, () => {
  console.log('Server running on http://localhost:3000');
});
