import type { NextApiRequest, NextApiResponse } from 'next';
import sendRequest from '@/utils/requestManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      let body = req.body;

      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
      }

      const {
        ticket_number,
        email,
        identification,
        ip,
        phone,
        name,
        last_name,
      } = body;

      if (!ticket_number) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const dataResponse = await sendRequest({
        req,
        endpoint: 'insert_payment',
        params: { ticket_number, email, identification, ip, phone, name, last_name }
      });

      return res.status(200).json({
        success: true,
        data: dataResponse.result,
      });
    } catch (error: any) {
      console.error('Error inserting payment:', error);
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  } 
  
  if (req.method === 'GET') {
    try {
      const temporalId = req.query.temporalId;
      if (!temporalId) {
        return res.status(400).json({ error: 'Missing temporal invoice' });
      }

      const dataResponse = await sendRequest({
        req,
        endpoint: 'get_payment',
        params: { tem_invoice: temporalId }
      });

      return res.status(200).json(dataResponse.result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  }
}
