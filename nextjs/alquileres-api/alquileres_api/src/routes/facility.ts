import { Router, Request, Response } from 'express';
import { odooGet } from '../lib/odooClient';

const router = Router();

router.get('*', async (req: Request, res: Response) => {
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  const odooPath = `/api/v1/reservation/facility${req.path}${query ? '?' + query : ''}`;

  try {
    const data = await odooGet(odooPath);
    res.json(data);
  } catch (error) {
    console.error(`GET ${req.originalUrl} error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
