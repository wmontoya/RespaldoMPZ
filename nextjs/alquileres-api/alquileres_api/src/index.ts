import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes';

const app = express();
const port = process.env.PORT ?? 4000;

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`alquileres-api running on port ${port}`);
});
