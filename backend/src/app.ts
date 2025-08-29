import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import routesRouter from './routes';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routesRouter);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

export default app;


