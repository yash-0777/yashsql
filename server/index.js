import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRouter from './src/routes/auth.js';
import recipesRouter from './src/routes/recipes.js';
import { ensureDataDirs } from './src/utils/fsUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ensureDataDirs();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'recipeshare-server' });
});

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`RecipeShare API listening on http://localhost:${PORT}`);
});

