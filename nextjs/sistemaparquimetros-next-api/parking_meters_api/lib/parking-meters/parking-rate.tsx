import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await sendRequest({
      req,
      endpoint: 'get_parking_rate'
    });

    return res.status(200).json(result.result);
  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', detail: error.message });
  }
}
